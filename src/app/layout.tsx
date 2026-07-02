import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Employee Attendance System",
  description: "Internal HR and workforce attendance management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased">{children}</body>
    </html>
  );
}
