import { expect, test } from "bun:test";
import { withBase } from "../src/core/with-base";

test.each([
  ["", "/logo.svg", "/logo.svg"],
  ["/", "/logo.svg", "/logo.svg"],
  ["/repo/", "/logo.svg", "/repo/logo.svg"],
  ["/repo", "/logo.svg", "/repo/logo.svg"],
  ["/a/b/", "/images/hero.png", "/a/b/images/hero.png"],
  ["./", "/logo.svg", "./logo.svg"],
  [
    "https://cdn.example.com/a/",
    "/logo.svg",
    "https://cdn.example.com/a/logo.svg",
  ],
  ["/repo/", "logo.svg", "/repo/logo.svg"],
])("withBase(%p, %p) -> %p", (base, path, expected) => {
  expect(withBase(base, path)).toBe(expected);
});
