import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Owner panel", template: "%s | Owner panel" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return <div className="flex min-h-full flex-1 flex-col bg-surface">{children}</div>;
}
