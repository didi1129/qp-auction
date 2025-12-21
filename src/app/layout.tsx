import type { Metadata } from "next";
import "./globals.css";
import 'galmuri/dist/galmuri.css'

export const metadata: Metadata = {
  title: "큐플옥션 (Qplay Auction)",
  description: "큐플레이 경매장",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="dark">
      <body
        className='antialiased bg-background text-foreground'
      >
        {children}
      </body>
    </html>
  );
}
