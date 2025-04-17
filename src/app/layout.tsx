import "~/styles/globals.css";
import { Inter } from "next/font/google";
import { type Metadata } from "next";
import { FontLoader } from '~/components/font-loader';

// Метаданные для страницы
export const metadata: Metadata = {
  title: "Ridex Design App",
  description: "Design application for Ridex",
  icons: [{ rel: "icon", url: "/ridex-favicon.ico" }],
};

// Настройка шрифта
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@100;300;400;500;600;700;900&family=Lato:wght@100;300;400;500;600;700;900&family=Montserrat:wght@100;300;400;500;600;700;900&family=Nunito:wght@100;300;400;500;600;700;900&family=Open+Sans:wght@100;300;400;500;600;700;900&family=Poppins:wght@100;300;400;500;600;700;900&family=Raleway:wght@100;300;400;500;600;700;900&family=Roboto:wght@100;300;400;500;600;700;900&family=Source+Sans+Pro:wght@100;300;400;500;600;700;900&family=Ubuntu:wght@100;300;400;500;600;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="overflow-hidden overscroll-none">
        <FontLoader />
        {children}
      </body>
    </html>
  );
}
