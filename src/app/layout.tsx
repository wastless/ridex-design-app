import "~/styles/globals.css";
import { Inter } from "next/font/google";
import { type Metadata } from "next";

// Метаданные для страницы
export const metadata: Metadata = {
  title: "Ridex",
  description: "Drawing",
  icons: [{ rel: "icon", url: "/ridex-favicon.ico" }],
};

// Настройка шрифта
const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-sans",
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <body className="overflow-hidden overscroll-none">{children}</body>
    </html>
  );
}
