import { describe, expect, it } from "vitest";
import {
  buildAvatarBoxClass,
  hasExplicitSquareContainer,
} from "./avatar-box-class";

describe("AvatarImage box classes", () => {
  it("always includes shrink-0, aspect-square, and size token by default", () => {
    const box = buildAvatarBoxClass({ size: "xs", rounded: "full" });
    expect(box).toContain("shrink-0");
    expect(box).toContain("aspect-square");
    expect(box).toContain("size-8");
    expect(box).toContain("min-h-8");
    expect(box).toContain("min-w-8");
    expect(box).toContain("rounded-full");
  });

  it("keeps size token when container is only w-full h-full", () => {
    expect(hasExplicitSquareContainer("w-full h-full")).toBe(false);
    const box = buildAvatarBoxClass({
      size: "sm",
      rounded: "full",
      containerClassName: "w-full h-full",
    });
    expect(box).toContain("size-12");
    expect(box).toContain("shrink-0");
    expect(box).toContain("aspect-square");
    expect(box).toContain("w-full");
    expect(box).toContain("h-full");
  });

  it("drops default size token when container supplies explicit square dims", () => {
    expect(
      hasExplicitSquareContainer("h-10 w-10 min-h-10 min-w-10 border")
    ).toBe(true);
    const box = buildAvatarBoxClass({
      size: "xs",
      rounded: "full",
      containerClassName: "h-10 w-10 min-h-10 min-w-10 border border-slate-200",
    });
    expect(box).not.toContain("size-8");
    expect(box).toContain("h-10");
    expect(box).toContain("w-10");
    expect(box).toContain("shrink-0");
    expect(box).toContain("aspect-square");
  });

  it("treats responsive ring sizes as explicit square containers", () => {
    expect(
      hasExplicitSquareContainer("w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48")
    ).toBe(true);
  });
});
