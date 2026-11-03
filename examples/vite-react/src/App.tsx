import { assetPath } from "keltra";

// Uncomment this line to see the type error for a path that doesn't exist:
// assetPath("/images/hreo.svg");

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
      <img
        src={assetPath("/logo.svg")}
        alt="keltra logo"
        width={64}
        height={64}
      />
      <h1>keltra + Vite</h1>
      <img src={assetPath("/images/hero.svg")} alt="Hero" width={480} />
      <p>
        Add or remove a file in <code>public/</code> and the types update.
      </p>
    </main>
  );
}
