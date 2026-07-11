import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

function read(relativePath: string): string {
  return readFileSync(join(process.cwd(), relativePath), "utf8");
}

describe("marketing claims integrity", () => {
  it("avoids fixed tool-count claims in public docs and extension metadata", () => {
    const targets = [
      "README.md",
      "extension/README.md",
      "extension/manifest.json",
      "extension/popup.html",
      "messages/en.json",
      "messages/id.json",
    ];

    const disallowed = /\b(?:72\+|80\+|90\+)\b/;

    const offenders = targets.filter((file) => disallowed.test(read(file)));

    expect(offenders).toEqual([]);
  });
});
