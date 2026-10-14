import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "ScreenNest — A world of stories. Your little escape.",
  description:
    "Discover movies and series, build your watchlist, and find your next great story on ScreenNest.",
  applicationName: "ScreenNest",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
