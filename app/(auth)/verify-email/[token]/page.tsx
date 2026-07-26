import VerifyEmailCard from "@/app/(auth)/components/VerifyEmailCard";
import {
  resendVerificationEmailAction,
  verifyEmailAction,
} from "@/app/services/auth.action";

type VerifyEmailTokenPageProps = {
  params: Promise<{
    token: string;
  }>;
};

export default async function VerifyEmailTokenPage({
  params,
}: VerifyEmailTokenPageProps) {
  const { token } = await params;

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-10">
      <VerifyEmailCard
        key={token}
        resendVerificationEmailAction={resendVerificationEmailAction}
        token={token}
        verifyEmailAction={verifyEmailAction}
      />
    </main>
  );
}
