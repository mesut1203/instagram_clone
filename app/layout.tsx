import type { Metadata } from "next";
import "./globals.css";

const themeInitializationScript = `
  (function () {
    try {
      var storageKey = "instagram-color-theme";
      var savedTheme = localStorage.getItem(storageKey);
      var theme =
        savedTheme === "light" || savedTheme === "dark"
          ? savedTheme
          : "dark";

      document.documentElement.dataset.theme = theme;
      document.documentElement.style.colorScheme = theme;
    } catch (error) {
      document.documentElement.dataset.theme = "dark";
      document.documentElement.style.colorScheme = "dark";
    }
  })();
`;

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
    <html data-theme="dark" lang="vi" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{ __html: themeInitializationScript }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
