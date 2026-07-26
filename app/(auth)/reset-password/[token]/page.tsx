import ResetPasswordForm from "../../components/ResetPasswordForm";

type ResetPasswordPageProps = {
  params: Promise<{ token: string }>;
};

export default async function ResetPasswordPage({
  params,
}: ResetPasswordPageProps) {
  const { token } = await params;

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-10">
      <ResetPasswordForm token={token} />
    </main>
  );
}
