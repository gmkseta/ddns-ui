import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cloudflare DDNS Manager",
  description: "Cloudflare DNS API를 활용한 DDNS 관리 웹 UI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}