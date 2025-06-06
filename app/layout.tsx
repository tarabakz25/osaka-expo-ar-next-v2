import type { Metadata } from "next";
import { Zen_Kaku_Gothic_New, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const zenKakuGothicNew = Zen_Kaku_Gothic_New({
  subsets: ["latin"],
  weight: "400",
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: "400",
});


export const metadata: Metadata = {
  title: "Kamiyama AR Project",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${zenKakuGothicNew.className} ${jetBrainsMono.className} antialiased bg-[#2853A4]`}
      >
        {children}
      </body>
    </html>
  );
}
