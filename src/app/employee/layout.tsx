import { EmployeeSideNav } from "@/components/EmployeeSideNav";

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <EmployeeSideNav />
      <main className="ml-60 flex-1 min-h-screen">{children}</main>
    </div>
  );
}
