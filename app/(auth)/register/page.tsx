import LoginBanner from "../components/LoginBanner";
import RegisterForm from "../components/RegisterForm";

export default function RegisterPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 items-center justify-center px-4 py-6 md:py-4">
      <div className="grid w-full grid-cols-1 items-center gap-12 md:grid-cols-2 md:gap-16 lg:gap-20">
        <LoginBanner />
        <RegisterForm />
      </div>
    </main>
  );
}
