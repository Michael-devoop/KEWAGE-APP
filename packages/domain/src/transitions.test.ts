import { describe, expect, it } from "vitest";
import { canPerform, nextStatus } from "./transitions";

describe("job transitions", () => {
  it("lets a client cancel only while searching or assigned", () => {
    expect(canPerform("cancel", "SEARCHING", "client")).toBe(true);
    expect(canPerform("cancel", "ASSIGNED", "client")).toBe(true);
    expect(canPerform("cancel", "IN_PROGRESS", "client")).toBe(false);
    expect(canPerform("cancel", "COMPLETED", "client")).toBe(false);
  });

  it("never lets a client start or complete work", () => {
    expect(canPerform("start", "ASSIGNED", "client")).toBe(false);
    expect(canPerform("complete", "IN_PROGRESS", "client")).toBe(false);
  });

  it("lets the worker start assigned work then complete it", () => {
    expect(nextStatus("start", "ASSIGNED", "worker")).toBe("IN_PROGRESS");
    expect(canPerform("start", "IN_PROGRESS", "worker")).toBe(false);
    expect(nextStatus("complete", "IN_PROGRESS", "worker")).toBe("COMPLETED");
  });

  it("only allows rating after completion", () => {
    expect(canPerform("rate", "COMPLETED", "client")).toBe(true);
    expect(canPerform("rate", "ASSIGNED", "client")).toBe(false);
    expect(canPerform("rate", "COMPLETED", "worker")).toBe(false);
  });
});
