/** biome-ignore-all lint/performance/noImgElement: <explanation> */
import { assetPath } from "keltra";
import { Img } from "keltra/image/next";
import { ModeToggle } from "@/components/mode-toggle";

export default function Home() {
  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col">
      {/* Navbar with Mode Toggle */}
      <header className="border-border bg-card/50 sticky top-0 z-50 border-b backdrop-blur">
        <div className="container mx-auto flex h-16 max-w-4xl items-center justify-between px-6">
          <div className="flex items-center gap-2 text-lg font-bold">
            <span>✨ Keltra NextJS Example</span>
          </div>
          <ModeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-4xl flex-1 space-y-10 px-6 py-10">
        {/* Header */}
        <div className="border-border space-y-3 border-b pb-6 text-center sm:text-left">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Keltra Asset Guide
          </h1>
          <p className="text-muted-foreground">
            A simple guide showing how to type-safely use assets from your{" "}
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-sm">
              public/
            </code>{" "}
            directory.
          </p>
        </div>

        {/* TSCONFIG SETUP */}
        <div className="space-y-1 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-900 dark:text-amber-200">
          <h3 className="flex items-center gap-2 font-semibold">
            ⚠️ tsconfig setup
          </h3>
          <p className="text-xs leading-relaxed opacity-90">
            `keltra init` adds this for you. If you set up keltra manually, add
            <code className="bg-background/50 rounded px-1 py-0.5 font-mono">
              ".keltra/*.d.ts"
            </code>{" "}
            to your `tsconfig.json` `include`. Use that exact pattern — not just{" "}
            <code className="bg-background/50 rounded px-1 py-0.5 font-mono">
              ".keltra"
            </code>
            — otherwise TypeScript skips the dot-prefixed folder and paths stay
            plain strings.
          </p>
        </div>

        {/* HOW IT'S DONE SECTION */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">💡 How It's Done</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Method 1 */}
            <div className="border-border bg-card text-card-foreground space-y-3 rounded-xl border p-5">
              <h3 className="text-primary text-sm font-medium">
                1. Using standard tags (`assetPath`)
              </h3>
              <p className="text-muted-foreground text-xs">
                Great for regular <code className="font-mono">&lt;img&gt;</code>{" "}
                tags or SVGs. Autocomplete suggests available files.
              </p>
              <pre className="bg-muted text-foreground overflow-x-auto rounded p-3 font-mono text-xs">
                {`<img 
  src={assetPath("/logo-dark.svg")} 
  alt="Logo" 
/>`}
              </pre>
            </div>

            {/* Method 2 */}
            <div className="border-border bg-card text-card-foreground space-y-3 rounded-xl border p-5">
              <h3 className="text-primary text-sm font-medium">
                2. Using Next.js Image (`keltra/image/next`)
              </h3>
              <p className="text-muted-foreground text-xs">
                Drop-in replacement for{" "}
                <code className="font-mono">next/image</code> with typed{" "}
                <code className="font-mono">src</code> strings.
              </p>
              <pre className="bg-muted text-foreground overflow-x-auto rounded p-3 font-mono text-xs">
                {`<Img 
  src="/KT.png" 
  width={80} 
  height={80} 
  alt="Avatar" 
/>`}
              </pre>
            </div>
          </div>
        </section>

        {/* LIVE ASSETS SHOWCASE */}
        <section className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold">
              🖼️ Your Public Assets Live Preview
            </h2>
            <p className="text-muted-foreground mt-1 text-xs">
              Edit{" "}
              <code className="text-foreground font-mono">app/page.tsx</code> to
              change how these are displayed.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {/* KT.png */}
            <div className="border-border bg-card text-card-foreground flex flex-col items-center justify-center gap-3 rounded-xl border p-4">
              <Img src="/KT.png" alt="KT" width={64} height={64} />
              <div className="text-center">
                <p className="font-mono text-xs font-medium">/KT.png</p>
                <span className="text-muted-foreground text-[10px]">
                  Rendered with &lt;Img&gt;
                </span>
              </div>
            </div>

            {/* Icons */}
            <div className="border-border bg-card text-card-foreground flex flex-col items-center justify-center gap-3 rounded-xl border p-4">
              <div className="flex items-center gap-4">
                <img
                  src={assetPath("/icon-light.svg")}
                  alt="Light Icon"
                  className="h-8 w-8 dark:hidden"
                />
                <img
                  src={assetPath("/icon-dark.svg")}
                  alt="Dark Icon"
                  className="hidden h-8 w-8 dark:block"
                />
              </div>
              <div className="text-center">
                <p className="font-mono text-xs font-medium">/icon-*.svg</p>
                <span className="text-muted-foreground text-[10px]">
                  Light & Dark variants
                </span>
              </div>
            </div>

            {/* Tight Logos */}
            <div className="border-border bg-card text-card-foreground flex flex-col items-center justify-center gap-3 rounded-xl border p-4">
              <div className="flex w-full flex-col items-center gap-2">
                <img
                  src={assetPath("/logo-tight-light.svg")}
                  alt="Tight Light"
                  className="h-5 w-auto dark:hidden"
                />
                <img
                  src={assetPath("/logo-tight-dark.svg")}
                  alt="Tight Dark"
                  className="hidden h-5 w-auto dark:block"
                />
              </div>
              <div className="text-center">
                <p className="font-mono text-xs font-medium">
                  /logo-tight-*.svg
                </p>
                <span className="text-muted-foreground text-[10px]">
                  Compact Brand Marks
                </span>
              </div>
            </div>

            <div className="border-border bg-card text-card-foreground col-span-3 flex flex-col items-center justify-center gap-3 rounded-xl border p-4">
              <div className="flex w-full flex-col items-center gap-2">
                <img
                  src={assetPath("/og-image.webp")}
                  alt="OpenGraph"
                  className="h-auto w-auto"
                />
              </div>
              <div className="text-center">
                <p className="font-mono text-xs font-medium">/og-image.webp</p>
                <span className="text-muted-foreground text-[10px]">
                  Opengraph Image
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
