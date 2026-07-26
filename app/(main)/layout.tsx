import { getCurrentUser } from "@/app/services/auth.action";
import { redirect } from "next/navigation";
import AuthenticatedSidebar from "./components/AuthenticatedSidebar";

type CurrentUser = {
  email?: string;
  fullName?: string;
  name?: string;
  username?: string;
};

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = (await getCurrentUser().catch(() => null)) as
    | CurrentUser
    | null
    | undefined;

  if (!currentUser) {
    redirect("/login");
  }

  const username =
    currentUser.username ?? currentUser.email?.split("@")[0] ?? "instagram";
  const displayName = currentUser.fullName ?? currentUser.name ?? username;

  return (
    <div className="min-h-dvh bg-[#0b0e12] text-[#f5f5f5]">
      <AuthenticatedSidebar
        user={{
          displayName,
          initial: displayName.charAt(0).toUpperCase(),
          username,
        }}
      />
      <main className="min-h-dvh lg:pl-[264px]">{children}</main>
      <button
        aria-label="Mở tin nhắn"
        className="fixed right-6 bottom-6 hidden items-center gap-3 rounded-full bg-[#26292f] px-6 py-4 text-lg font-bold text-white shadow-2xl shadow-black/40 transition hover:bg-[#31353c] lg:flex"
        type="button"
      >
        <svg aria-hidden="true" className="size-7" fill="none" viewBox="0 0 24 24">
          <path d="M20.5 4.2 3.8 10.7l6.5 2.5 2.5 6.5 7.7-15.5Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="2" />
          <path d="m10.3 13.2 3.5-3.5" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
        </svg>
        Tin nhắn
      </button>
    </div>
  );
}
