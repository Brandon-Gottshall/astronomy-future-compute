import "./globals.css";
import { COPY } from "../lib/copy.js";

export const metadata = {
  title: COPY.site.metadata.title,
  description: COPY.site.metadata.description,
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
