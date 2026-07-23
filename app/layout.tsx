import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Instagram - Đăng nhập",
  description:
    "Đăng nhập vào Instagram để xem ảnh và video từ bạn bè, gia đình và những người bạn yêu thích.",
  keywords: "Instagram, đăng nhập, mạng xã hội, chia sẻ ảnh",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
