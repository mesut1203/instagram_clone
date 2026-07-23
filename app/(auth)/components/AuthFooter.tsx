import Link from "next/link";

const footerLinks = [
  "Meta",
  "Giới thiệu",
  "Instagram Lite",
  "Vị trí",
  "Blog",
  "Việc làm",
  "Trợ giúp",
  "API",
  "Quyền riêng tư",
  "Điều khoản",
];

export default function AuthFooter() {
  return (
    <footer className="mx-auto w-full max-w-5xl space-y-2 px-4 py-6 text-center text-[11px] text-neutral-500">
      <nav aria-label="Liên kết chân trang">
        <ul className="flex flex-wrap justify-center gap-x-4 gap-y-2">
          {footerLinks.map((label) => (
            <li key={label}>
              <Link href="#" className="transition hover:underline">
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <p className="pt-2">© 2026 Instagram from F8</p>
    </footer>
  );
}
