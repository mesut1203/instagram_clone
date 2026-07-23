import LoginBanner from "../components/LoginBanner";
import LoginForm from "../components/LoginForm";

export default function LoginPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 items-center justify-center px-4 py-12">
      <div className="grid w-full grid-cols-1 items-center gap-12 md:grid-cols-2 md:gap-16 lg:gap-20">
        <LoginBanner />
        <LoginForm />
      </div>
    </main>
  );
}
