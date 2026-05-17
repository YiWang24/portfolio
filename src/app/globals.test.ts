import fs from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";

describe("globals.css mobile hero styles", () => {
  test("mobile hero uses light background with dark override", () => {
    const cssPath = path.resolve(__dirname, "./globals.css");
    const css = fs.readFileSync(cssPath, "utf-8");

    expect(css).toMatch(/@media \(max-width: 767px\)[\s\S]*?\.hero-frame\s*\{/);
    expect(css).toMatch(
      /@media \(max-width: 767px\)[\s\S]*?\.hero-frame\s*\{[\s\S]*background:\s*hsl\(var\(--card\)/i
    );
    expect(css).toMatch(
      /@media \(max-width: 767px\)[\s\S]*?\.dark\s+\.hero-frame\s*\{[\s\S]*background:\s*rgba\(10, 10, 10, 0\.95\)/i
    );
  });

  test("mobile terminal surfaces are light in light mode", () => {
    const cssPath = path.resolve(__dirname, "./globals.css");
    const css = fs.readFileSync(cssPath, "utf-8");

    expect(css).toMatch(
      /@media \(max-width: 767px\)[\s\S]*?\.hero-terminal\s*\{[\s\S]*background:\s*hsl\(var\(--card\)/i
    );
    expect(css).toMatch(
      /@media \(max-width: 767px\)[\s\S]*?\.dark\s+\.hero-terminal\s*\{[\s\S]*background:\s*rgba\(5, 5, 5, 0\.9/i
    );
    expect(css).toMatch(
      /@media \(max-width: 767px\)[\s\S]*?\.cli-input-line\s*\{[\s\S]*background:\s*hsl\(var\(--card\)/i
    );
    expect(css).toMatch(
      /@media \(max-width: 767px\)[\s\S]*?\.dark\s+\.cli-input-line\s*\{[\s\S]*background:\s*rgba\(10, 10, 10, 0\.95\)/i
    );
  });
});
