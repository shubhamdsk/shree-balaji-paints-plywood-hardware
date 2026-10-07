import type { Metadata } from "next";
import ChangePasswordForm from "@/components/admin/ChangePasswordForm";
import { requireOwner } from "@/server/auth/guard";

export const metadata: Metadata = { title: "Change password" };

export default async function ChangePasswordPage() {
  await requireOwner();

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-heading sm:text-3xl">Change password</h1>
        <p className="mt-1 text-muted">You stay logged in here. Other phones and computers will need the new password.</p>
      </div>
      <div className="rounded-card border border-line bg-card p-5 shadow-card sm:p-8">
        <ChangePasswordForm />
      </div>
    </div>
  );
}
