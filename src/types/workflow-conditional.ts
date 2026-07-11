/**
 * Conditional Branch Types for Workflow
 * Framework for future conditional logic support
 */

export type ConditionType =
  | "file-count" // Based on number of files
  | "file-size" // Based on file size
  | "file-pages" // Based on number of pages
  | "file-format" // Based on file format/extension
  | "metadata" // Based on PDF metadata
  | "custom"; // Custom JavaScript expression

export type ComparisonOperator =
  | "equals"
  | "not-equals"
  | "greater-than"
  | "less-than"
  | "greater-or-equal"
  | "less-or-equal"
  | "contains"
  | "not-contains"
  | "matches"; // Regex match

export interface Condition {
  /** Type of condition */
  type: ConditionType;
  /** Field/property to check */
  field?: string;
  /** Comparison operator */
  operator: ComparisonOperator;
  /** Value to compare against */
  value: string | number | boolean;
}

export interface ConditionalBranch {
  /** Branch ID */
  id: string;
  /** Branch label */
  label: string;
  /** Conditions (all must be true for AND logic) */
  conditions: Condition[];
  /** Target node ID if conditions are met */
  targetNodeId: string;
  /** Priority (lower number = higher priority) */
  priority: number;
}

export interface ConditionalNodeData {
  /** Evaluation logic: 'any' = OR, 'all' = AND */
  logic: "any" | "all";
  /** List of branches to evaluate */
  branches: ConditionalBranch[];
  /** Default branch if no conditions match */
  defaultBranchId?: string;
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function toBoolean(value: unknown): boolean | null {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    if (value.toLowerCase() === "true") return true;
    if (value.toLowerCase() === "false") return false;
  }

  return null;
}

function compareValues(
  left: string | number | boolean,
  operator: ComparisonOperator,
  right: string | number | boolean,
): boolean {
  if (operator === "matches") {
    try {
      return new RegExp(String(right), "i").test(String(left));
    } catch {
      return false;
    }
  }

  if (operator === "contains" || operator === "not-contains") {
    const result = String(left)
      .toLowerCase()
      .includes(String(right).toLowerCase());
    return operator === "contains" ? result : !result;
  }

  const leftNum = toNumber(left);
  const rightNum = toNumber(right);

  if (leftNum !== null && rightNum !== null) {
    switch (operator) {
      case "equals":
        return leftNum === rightNum;
      case "not-equals":
        return leftNum !== rightNum;
      case "greater-than":
        return leftNum > rightNum;
      case "less-than":
        return leftNum < rightNum;
      case "greater-or-equal":
        return leftNum >= rightNum;
      case "less-or-equal":
        return leftNum <= rightNum;
      default:
        return false;
    }
  }

  const leftBool = toBoolean(left);
  const rightBool = toBoolean(right);
  if (leftBool !== null && rightBool !== null) {
    switch (operator) {
      case "equals":
        return leftBool === rightBool;
      case "not-equals":
        return leftBool !== rightBool;
      default:
        return false;
    }
  }

  const leftStr = String(left).toLowerCase();
  const rightStr = String(right).toLowerCase();
  switch (operator) {
    case "equals":
      return leftStr === rightStr;
    case "not-equals":
      return leftStr !== rightStr;
    case "greater-than":
      return leftStr > rightStr;
    case "less-than":
      return leftStr < rightStr;
    case "greater-or-equal":
      return leftStr >= rightStr;
    case "less-or-equal":
      return leftStr <= rightStr;
    default:
      return false;
  }
}

function getSizeMetric(files: File[], field?: string): number {
  const key = (field || "total").toLowerCase();
  const sizes = files.map((file) => file.size);

  switch (key) {
    case "min":
    case "smallest":
      return sizes.length > 0 ? Math.min(...sizes) : 0;
    case "max":
    case "largest":
      return sizes.length > 0 ? Math.max(...sizes) : 0;
    case "avg":
    case "average":
      return sizes.length > 0
        ? sizes.reduce((sum, size) => sum + size, 0) / sizes.length
        : 0;
    case "total":
    default:
      return sizes.reduce((sum, size) => sum + size, 0);
  }
}

function getFileExtension(file: File): string {
  const idx = file.name.lastIndexOf(".");
  if (idx === -1) return "";
  return file.name.slice(idx + 1).toLowerCase();
}

function getMetadataValues(
  files: File[],
  field?: string,
): Array<string | number | boolean> {
  const key = (field || "").toLowerCase();
  if (!key) return [];

  switch (key) {
    case "name":
      return files.map((file) => file.name);
    case "type":
    case "mime":
      return files.map((file) => file.type);
    case "extension":
    case "ext":
      return files.map(getFileExtension);
    case "size":
      return files.map((file) => file.size);
    case "lastmodified":
    case "last-modified":
      return files.map((file) => file.lastModified);
    default:
      return [];
  }
}

/**
 * Evaluate a single condition against input files
 * Supports file-count, file-size, file-format and metadata conditions.
 * file-pages and custom conditions are intentionally pending.
 */
export function evaluateCondition(
  condition: Condition,
  files: File[],
): boolean {
  if (!Array.isArray(files) || files.length === 0) {
    return false;
  }

  switch (condition.type) {
    case "file-count":
      return compareValues(files.length, condition.operator, condition.value);

    case "file-size": {
      const metric = getSizeMetric(files, condition.field);
      return compareValues(metric, condition.operator, condition.value);
    }

    case "file-format": {
      const expected = String(condition.value).replace(/^\./, "").toLowerCase();
      const extensions = files.map(getFileExtension);

      switch (condition.operator) {
        case "equals":
          return extensions.some((ext) => ext === expected);
        case "not-equals":
          return extensions.every((ext) => ext !== expected);
        case "contains":
          return extensions.some((ext) => ext.includes(expected));
        case "not-contains":
          return extensions.every((ext) => !ext.includes(expected));
        case "matches": {
          try {
            const regex = new RegExp(String(condition.value), "i");
            return extensions.some((ext) => regex.test(ext));
          } catch {
            return false;
          }
        }
        default:
          return false;
      }
    }

    case "metadata": {
      const values = getMetadataValues(files, condition.field);
      if (values.length === 0) return false;
      return values.some((value) =>
        compareValues(value, condition.operator, condition.value),
      );
    }

    case "file-pages":
    case "custom":
      return false;

    default:
      return false;
  }
}

/**
 * Evaluate all conditions for a branch
 * Applies AND/OR logic based on the provided mode.
 */
export function evaluateBranch(
  branch: ConditionalBranch,
  files: File[],
  logic: "any" | "all",
): boolean {
  if (!branch.conditions || branch.conditions.length === 0) {
    return false;
  }

  if (logic === "any") {
    return branch.conditions.some((condition) =>
      evaluateCondition(condition, files),
    );
  }

  return branch.conditions.every((condition) =>
    evaluateCondition(condition, files),
  );
}

/**
 * Select the appropriate branch based on conditions
 * Branches are evaluated by ascending priority value.
 */
export function selectBranch(
  branches: ConditionalBranch[],
  files: File[],
  logic: "any" | "all",
  defaultBranchId?: string,
): string | null {
  if (!branches || branches.length === 0) {
    return defaultBranchId || null;
  }

  // Sort branches by priority
  const sortedBranches = [...branches].sort((a, b) => a.priority - b.priority);

  // Evaluate each branch
  for (const branch of sortedBranches) {
    if (evaluateBranch(branch, files, logic)) {
      return branch.targetNodeId;
    }
  }

  // Return default branch if no conditions matched
  return defaultBranchId || null;
}
