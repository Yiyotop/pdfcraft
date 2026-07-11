import { describe, expect, it } from "vitest";
import { PDFErrorCode } from "@/types/pdf";
import { createEncryptProcessor } from "@/lib/pdf/processors/encrypt";
import { createDecryptProcessor } from "@/lib/pdf/processors/decrypt";
import { createRepairProcessor } from "@/lib/pdf/processors/repair";
import { createOCRProcessor } from "@/lib/pdf/processors/ocr";
import { createOrganizeProcessor } from "@/lib/pdf/processors/organize";

function createFile(name: string, type = "application/pdf"): File {
  return new File([new Uint8Array([1, 2, 3])], name, { type });
}

describe("critical processor validation paths", () => {
  it("encrypt returns INVALID_OPTIONS when no password is provided", async () => {
    const processor = createEncryptProcessor();
    const file = createFile("input.pdf");

    const result = await processor.process({
      files: [file],
      options: {
        userPassword: "",
        ownerPassword: "",
      },
    });

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe(PDFErrorCode.INVALID_OPTIONS);
  });

  it("decrypt returns INVALID_OPTIONS when password is missing", async () => {
    const processor = createDecryptProcessor();
    const file = createFile("input.pdf");

    const result = await processor.process({
      files: [file],
      options: { password: "" },
    });

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe(PDFErrorCode.INVALID_OPTIONS);
  });

  it("repair returns INVALID_OPTIONS when file count is not exactly one", async () => {
    const processor = createRepairProcessor();
    const result = await processor.process({ files: [], options: {} });

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe(PDFErrorCode.INVALID_OPTIONS);
  });

  it("ocr returns FILE_TYPE_INVALID for non-PDF input", async () => {
    const processor = createOCRProcessor();
    const file = createFile("input.txt", "text/plain");

    const result = await processor.process({ files: [file], options: {} });

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe(PDFErrorCode.FILE_TYPE_INVALID);
  });

  it("organize returns INVALID_OPTIONS when page order is missing", async () => {
    const processor = createOrganizeProcessor();
    const file = createFile("input.pdf");

    const result = await processor.process({ files: [file], options: {} });

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe(PDFErrorCode.INVALID_OPTIONS);
  });
});
