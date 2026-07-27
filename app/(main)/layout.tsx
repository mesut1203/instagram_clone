import { getCurrentUser } from "@/app/services/auth.action";
import { resolveApiAssetUrl } from "@/app/services/api-client";
import { getUnreadMessageCount } from "@/app/services/message.action";
import { redirect } from "next/navigation";
import AuthenticatedSidebar from "./components/AuthenticatedSidebar";
import FloatingMessagesButton from "./components/FloatingMessagesButton";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentUser, unreadResult] = await Promise.all([
    getCurrentUser().catch(() => null),
    getUnreadMessageCount().catch(() => null),
  ]);

  if (!currentUser) {
    redirect("/login");
  }

  const username =
    currentUser.username ?? currentUser.email?.split("@")[0] ?? "instagram";
  const displayName = currentUser.fullName?.trim() || username;
  const unreadCount = unreadResult?.success
    ? unreadResult.data.unreadCount
    : 0;

  return (
    <div
      className="min-h-dvh bg-[var(--app-background)] text-[var(--app-text)]"
      data-app-shell
    >
      <AuthenticatedSidebar
        unreadCount={unreadCount}
        user={{
          displayName,
          initial: displayName.charAt(0).toUpperCase(),
          profilePicture: resolveApiAssetUrl(currentUser.profilePicture),
        }}
      />
      <main className="min-h-dvh pb-20 lg:pb-0 lg:pl-[var(--app-sidebar-width)]">
        {children}
      </main>
      <FloatingMessagesButton unreadCount={unreadCount} />
    </div>
  );
}
