import "./globals.css";

export const metadata = {
  title: "Astronomy’s Future Compute — ASTR 1020K",
  description:
    "Comparing land-based, underwater, and orbital data-center paths for modern astronomy.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Tailwind via CDN preserves the original utility-class workflow. */}
        <script src="https://cdn.tailwindcss.com" />
      </head>
      <body>
        <div id="app">{children}</div>
      </body>
    </html>
  );
}
