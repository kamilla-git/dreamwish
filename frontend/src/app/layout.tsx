import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "DreamWish — Социальный вишлист 2026",
  description: "Создавай списки желаний. Делись с близкими. Получай то, о чём мечтал — без лишних слов.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const observer = new MutationObserver((mutations) => {
                  for (const mutation of mutations) {
                    if (mutation.type === 'attributes') {
                      const target = mutation.target;
                      if (target.getAttributeNames) {
                        target.getAttributeNames().forEach(name => {
                          if (name.startsWith('data-') && name !== 'data-theme') {
                            // target.removeAttribute(name); // Silent cleanup
                          }
                        });
                      }
                    }
                  }
                });
                observer.observe(document.documentElement, { attributes: true, subtree: true });
              })();
            `,
          }}
        />
      </head>
      <body className="antialiased bg-[#050505] selection:bg-indigo-500/30" suppressHydrationWarning>
        {children}
        <Toaster position="top-center" expand={true} richColors theme="dark" />
      </body>
    </html>
  );
}
