import { AdminSideNav } from "@/components/AdminSideNav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSideNav />
      <main className="ml-60 flex-1 min-h-screen">{children}</main>
    </div>
  );
}
