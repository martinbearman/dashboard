import type { Metadata } from "next";
import { Lexend } from "next/font/google";
import "./globals.css";
import StoreProvider from "@/lib/store/StoreProvider";

const lexend = Lexend({
  subsets: ["latin"],
  variable: "--font-lexend",
});

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Modular dashboard with customizable widgets",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={lexend.variable}>
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}

