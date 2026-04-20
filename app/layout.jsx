import "./globals.css";

export const metadata = {
  title: "Astronomy's Future Compute — ASTR 1020K Web Paper",
  description:
    "Student paper and presentation for ASTR 1020K: land, underwater, and orbital data-center paths and their consequences for astronomy.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div id="app">{children}</div>
      </body>
    </html>
  );
}
