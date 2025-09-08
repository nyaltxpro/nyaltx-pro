import type { ReactNode } from "react";

export const metadata = {
  title: "Admin Dashboard",
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-gray-800 bg-black/60 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-semibold">NYAX Admin</h1>
          <form action="/api/admin/logout" method="post">
            <button className="rounded-md border border-gray-700 px-3 py-1 text-sm hover:bg-gray-800" type="submit">
              Log out
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8">
        {children}
      </main>
    </div>
  );
}
