import { assetPath } from "keltra";
import { Image } from "keltra/image/next";

// Uncomment either line to see the type error for a path that does not exist:
// assetPath("/images/hreo.png");
// <Image src="/images/hreo.png" alt="" width={1} height={1} />

export default function Page() {
  return (
    <main
      style={{
        fontFamily: "system-ui, sans-serif",
        display: "grid",
        justifyItems: "center",
        gap: 16,
        padding: 48,
      }}
    >
      {/* assetPath: a plain img gets the basePath from keltra */}
      <img
        src={assetPath("/logo.svg")}
        alt="keltra logo"
        width={64}
        height={64}
      />
      <h1>keltra + Next.js</h1>
      {/* Image: next/image with a typed src (Next applies basePath itself) */}
      <Image
        src="/images/hero.svg"
        alt="Hero"
        width={640}
        height={320}
        priority
      />
      <p>
        Add or remove a file in <code>public/</code> and the types update.
      </p>
    </main>
  );
}
