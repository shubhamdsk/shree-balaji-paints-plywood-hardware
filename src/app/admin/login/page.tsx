import type { Metadata } from "next";
import { redirect } from "next/navigation";
import LoginForm from "@/components/admin/LoginForm";
import Logo from "@/components/brand/Logo";
import { ROUTES } from "@/lib/routes";
import { getOwner } from "@/server/auth/guard";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage() {
  if (await getOwner()) redirect(ROUTES.admin);

  return (
    <main className="grid flex-1 place-items-center px-4 py-10">
      <div className="w-full max-w-sm rounded-card border border-line bg-card p-6 shadow-card sm:p-8">
        <Logo compact />
        <h1 className="mt-5 text-2xl font-extrabold text-heading">Owner login</h1>
        <p className="mt-1 mb-6 text-sm text-muted">Log in to update products, prices and stock.</p>
        <LoginForm />
      </div>
    </main>
  );
}
