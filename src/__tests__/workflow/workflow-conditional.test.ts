import { describe, it, expect } from "vitest";
import {
  evaluateCondition,
  evaluateBranch,
  selectBranch,
  type ConditionalBranch,
  type Condition,
} from "@/types/workflow-conditional";

function makeFile(name: string, size: number, type = "application/pdf"): File {
  return new File([new Uint8Array(size)], name, {
    type,
    lastModified: 1700000000000,
  });
}

describe("workflow conditional evaluation", () => {
  const files = [
    makeFile("report.pdf", 1000),
    makeFile(
      "invoice.docx",
      3000,
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ),
  ];

  it("evaluates file-count conditions", () => {
    const condition: Condition = {
      type: "file-count",
      operator: "greater-than",
      value: 1,
    };

    expect(evaluateCondition(condition, files)).toBe(true);
  });

  it("evaluates file-size conditions using total metric by default", () => {
    const condition: Condition = {
      type: "file-size",
      operator: "greater-or-equal",
      value: 4000,
    };

    expect(evaluateCondition(condition, files)).toBe(true);
  });

  it("evaluates file-size conditions using max metric", () => {
    const condition: Condition = {
      type: "file-size",
      field: "max",
      operator: "equals",
      value: 3000,
    };

    expect(evaluateCondition(condition, files)).toBe(true);
  });

  it("evaluates file-format conditions", () => {
    const condition: Condition = {
      type: "file-format",
      operator: "equals",
      value: "pdf",
    };

    expect(evaluateCondition(condition, files)).toBe(true);
  });

  it("evaluates metadata conditions", () => {
    const condition: Condition = {
      type: "metadata",
      field: "name",
      operator: "contains",
      value: "invoice",
    };

    expect(evaluateCondition(condition, files)).toBe(true);
  });

  it("evaluates branch with all logic", () => {
    const branch: ConditionalBranch = {
      id: "b1",
      label: "all-branch",
      targetNodeId: "target-1",
      priority: 1,
      conditions: [
        { type: "file-count", operator: "equals", value: 2 },
        { type: "file-format", operator: "equals", value: "pdf" },
      ],
    };

    expect(evaluateBranch(branch, files, "all")).toBe(true);
  });

  it("evaluates branch with any logic", () => {
    const branch: ConditionalBranch = {
      id: "b2",
      label: "any-branch",
      targetNodeId: "target-2",
      priority: 1,
      conditions: [
        { type: "file-count", operator: "equals", value: 10 },
        { type: "file-format", operator: "equals", value: "docx" },
      ],
    };

    expect(evaluateBranch(branch, files, "any")).toBe(true);
  });

  it("selects branch by priority and returns target node id", () => {
    const branches: ConditionalBranch[] = [
      {
        id: "b-low",
        label: "low priority",
        targetNodeId: "target-low",
        priority: 20,
        conditions: [{ type: "file-format", operator: "equals", value: "pdf" }],
      },
      {
        id: "b-high",
        label: "high priority",
        targetNodeId: "target-high",
        priority: 10,
        conditions: [{ type: "file-format", operator: "equals", value: "pdf" }],
      },
    ];

    expect(selectBranch(branches, files, "all")).toBe("target-high");
  });

  it("returns default branch when none match", () => {
    const branches: ConditionalBranch[] = [
      {
        id: "b-none",
        label: "none",
        targetNodeId: "target-none",
        priority: 1,
        conditions: [
          { type: "file-count", operator: "greater-than", value: 50 },
        ],
      },
    ];

    expect(selectBranch(branches, files, "all", "default-target")).toBe(
      "default-target",
    );
  });
});
