import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PhotoDrop",
  description: "Photo delivery system for businesses",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}