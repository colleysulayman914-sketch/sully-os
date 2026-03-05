import type { Metadata } from "next";
import { Poppins, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Sully OS",
    template: "%s | Sully OS",
  },
  description: "Your personal system for finance, tasks, activities and more",
  icons: {
    icon: "/Favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster
          position="top-right"
          richColors
          closeButton
          className="!top-4 !right-4 !left-auto w-[calc(100vw-2rem)] max-w-[360px] sm:!top-6 sm:!right-6"
        />
      </body>
    </html>
  );
}
