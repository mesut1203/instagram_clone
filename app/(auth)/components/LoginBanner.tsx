import { Star } from "lucide-react";
import Image from "next/image";

export default function LoginBanner() {
  return (
    <div className="relative hidden h-[500px] items-center justify-center md:flex">
      <div className="absolute left-10 h-72 w-48 -rotate-12 transform overflow-hidden rounded-2xl border border-neutral-800 brightness-75 shadow-2xl">
        <Image
          alt="Khoảnh khắc được chia sẻ"
          className="object-cover"
          fill
          sizes="192px"
          src="https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&q=80&w=400"
        />
        <div className="absolute -left-4 bottom-16 animate-bounce text-3xl">
          ❤️
        </div>
      </div>

      <div className="absolute right-10 h-64 w-44 rotate-12 transform overflow-hidden rounded-2xl border border-neutral-800 brightness-90 shadow-2xl">
        <Image
          alt="Ảnh trong story"
          className="object-cover"
          fill
          sizes="176px"
          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400"
        />
        <div className="absolute -right-2 top-8 rounded-full bg-green-500 p-1.5 shadow-md">
          <Star aria-hidden="true" className="size-4 text-white" fill="currentColor" />
        </div>
      </div>

      <div className="relative z-10 h-96 w-60 overflow-hidden rounded-3xl border-4 border-neutral-900 bg-neutral-950 shadow-2xl">
        <Image
          alt="Story nổi bật"
          className="object-cover"
          fill
          preload
          sizes="240px"
          src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=500"
        />
        <div className="absolute left-4 top-4 flex items-center space-x-1 rounded-full bg-black/40 px-3 py-1 text-xs backdrop-blur-md">
          <span>🔥</span>
          <span>💎</span>
          <span>💜</span>
        </div>
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
          <div className="h-1.5 w-2/3 overflow-hidden rounded-full bg-white/40">
            <div className="h-full w-1/2 rounded-full bg-white" />
          </div>
          <button className="text-white transition hover:scale-110">🤍</button>
        </div>
      </div>

      <div className="absolute bottom-16 right-16 z-20 h-12 w-12 overflow-hidden rounded-full border-2 border-pink-500 bg-black p-0.5">
        <Image
          alt="Ảnh đại diện"
          className="rounded-full object-cover"
          fill
          sizes="48px"
          src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150"
        />
      </div>
    </div>
  );
}
