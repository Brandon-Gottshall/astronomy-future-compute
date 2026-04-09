import "./globals.css";

export const metadata = {
  title: "Astronomy’s Future Compute — ASTR 1020K Web Paper",
  description:
    "Student paper and presentation for ASTR 1020K: land, underwater, and orbital data-center paths and their consequences for astronomy.",
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
