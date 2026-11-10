import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { KTImg } from "../src/image";

test("renders an img with lazy loading by default", () => {
  const html = renderToStaticMarkup(
    <KTImg src="/logo.svg" alt="Logo" width={64} height={64} />,
  );
  expect(html).toContain('src="/logo.svg"');
  expect(html).toContain('alt="Logo"');
  expect(html).toContain('width="64"');
  expect(html).toContain('loading="lazy"');
  expect(html).toContain('decoding="async"');
});

test("priority loads eagerly with high fetch priority", () => {
  const html = renderToStaticMarkup(
    <KTImg src="/logo.svg" alt="" width={10} height={10} priority />,
  );
  expect(html).toContain('loading="eager"');
  expect(html).toContain('fetchPriority="high"');
});

test("fill drops width and height and stretches to the parent", () => {
  const html = renderToStaticMarkup(
    <KTImg src="/logo.svg" alt="" width={10} height={10} fill />,
  );
  expect(html).not.toContain("width=");
  expect(html).toContain("position:absolute");
  expect(html).toContain("width:100%");
});

test("explicit loading wins over priority", () => {
  const html = renderToStaticMarkup(
    <KTImg src="/logo.svg" alt="" priority loading="lazy" />,
  );
  expect(html).toContain('loading="lazy"');
});
