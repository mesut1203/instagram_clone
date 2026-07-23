import AuthFooter from "./components/AuthFooter";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col justify-between bg-black font-sans text-white antialiased selection:bg-blue-600">
      {children}
      <AuthFooter />
    </div>
  );
}
