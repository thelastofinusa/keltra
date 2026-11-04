import { assetPath } from "keltra";
import { Image } from "keltra/image";

// Uncomment either line to see the type error for a path that does not exist:
// assetPath("/images/hreo.svg");
// <Image src="/images/hreo.svg" alt="" />

export default function App() {
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
      {/* assetPath: use it anywhere a string URL is expected */}
      <img
        src={assetPath("/logo.svg")}
        alt="keltra logo"
        width={64}
        height={64}
      />
      <h1>keltra + Vite</h1>
      {/* Image: same typed paths, with loading defaults built in */}
      <Image
        src="/images/hero.svg"
        alt="Hero"
        width={480}
        height={240}
        priority
      />
      <p>
        Add or remove a file in <code>public/</code> and the types update.
      </p>
    </main>
  );
}
