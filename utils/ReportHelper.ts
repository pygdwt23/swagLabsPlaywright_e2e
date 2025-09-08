import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  ImageRun,
} from "docx";
import * as fs from "fs-extra";
import path from "path";
import { Jimp } from "jimp";   // ✅ perbaikan import Jimp

export class ReportHelper {
  private children: Paragraph[] = [];
  private reportName: string;

  constructor(reportName: string) {
    this.reportName = reportName;
    fs.ensureDirSync("reports"); // bikin folder reports kalau belum ada
  }

  addTestInfo(
    testCaseId: string,
    scenario: string,
    parameters: Record<string, string>,
    result: "PASS" | "FAIL",
    startTime: Date,
    endTime: Date
  ) {
    this.children.push(
      new Paragraph({
        text: `Test Case: ${testCaseId}`,
        heading: HeadingLevel.HEADING_1,
      }),
      new Paragraph({
        text: `Scenario: ${scenario}`,
        heading: HeadingLevel.HEADING_1,
      }),
      new Paragraph({
        text: `Result: ${result}`,
      }),
      new Paragraph({
        text: `Start Time: ${startTime.toLocaleString()}`,
      }),
      new Paragraph({
        text: `End Time: ${endTime.toLocaleString()}`,
      }),
      new Paragraph({
        text: "Parameters:",
      }),
      ...Object.entries(parameters).map(
        ([key, value]) =>
          new Paragraph({
            text: `${key}: ${value}`,
          })
      )
    );
  }

  addText(text: string) {
    this.children.push(new Paragraph({ children: [new TextRun(text)] }));
  }

  /**
   * Screenshot + kasih timestamp + masukin ke report
   */
  async addScreenshot(page: any, description: string) {
    const now = new Date();
    const dtString = now.toLocaleString("id-ID", { hour12: false });
    const screenshotPath = path.join("screenshots", `${Date.now()}.png`);

    await fs.ensureDir("screenshots");
    await page.screenshot({ path: screenshotPath, fullPage: true });

    // buka screenshot pakai Jimp
    // const image = await Jimp.read(screenshotPath);
    // const font = await Jimp.loadFont(Jimp.FONT_SANS_16_RED);

    // // tulis timestamp di bawah gambar
    // image.print(font, 10, image.bitmap.height - 25, dtString);

    // // save ulang
    // await image.write(screenshotPath); // ✅ writeAsync tidak perlu di v0.22

    // convert ke buffer buat docx
    const imageBuffer = await fs.readFile(screenshotPath);

    this.children.push(
      new Paragraph({
        text: description,
        heading: HeadingLevel.HEADING_2,
      }),
      new Paragraph({
        children: [
          new ImageRun({
            data: imageBuffer,
            transformation: {
              width: 600,
              // height otomatis menyesuaikan (hapus Jimp.AUTO)
            },
          }),
        ],
      }),
      new Paragraph({ text: "" })
    );
  }

  addHeading(text: string) {
    this.children.push(
      new Paragraph({
        text,
        heading: HeadingLevel.HEADING_1,
      })
    );
  }

  addHeadingFail(text: string) {
    this.children.push(
      new Paragraph({
        children: [new TextRun({ text, bold: true, color: "FF0000" })],
      })
    );
  }

  async clearTempScreenshots() {
    const dir = "screenshots";
    if (await fs.pathExists(dir)) {
      const files = await fs.readdir(dir);
      for (const file of files) {
        await fs.remove(path.join(dir, file));
      }
    }
  }

  async saveReport() {
    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 567,
                bottom: 567,
                left: 567,
                right: 567,
              },
            },
          },
          children:
            this.children.length > 0
              ? this.children
              : [new Paragraph({ text: "" })],
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);
    const filePath = path.join("reports", `${this.reportName}.docx`);
    await fs.writeFile(filePath, buffer);
  }
}
