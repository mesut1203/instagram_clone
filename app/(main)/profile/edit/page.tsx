import { getOwnProfile } from "@/app/services/user.action";
import ProfileError from "../components/ProfileError";
import EditProfileForm from "./EditProfileForm";

export default async function EditProfilePage() {
  const profileResult = await getOwnProfile();

  if (!profileResult.success) {
    return <ProfileError message={profileResult.message} />;
  }

  return (
    <main className="mx-auto w-full max-w-[980px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <h1 className="text-2xl font-bold tracking-tight text-[var(--app-text)]">
        Chỉnh sửa trang cá nhân
      </h1>

      <section className="mt-6 rounded-3xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4 shadow-[0_14px_40px_rgb(0_0_0/0.10)] sm:mt-8 sm:p-6 lg:mt-10 lg:p-8">
        <EditProfileForm profile={profileResult.data} />
      </section>
    </main>
  );
}
