import AdminHeader from "@/components/admin/AdminHeader";
import { requireOwner } from "@/server/auth/guard";

export default async function PanelLayout({ children }: LayoutProps<"/admin">) {
  const owner = await requireOwner();

  return (
    <>
      <AdminHeader username={owner.username} />
      <main className="container-page flex-1 py-6 sm:py-10">{children}</main>
    </>
  );
}
