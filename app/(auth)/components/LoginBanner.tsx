export default function LoginBanner() {
  return (
    <div className="relative hidden h-[500px] items-center justify-center md:flex">
      <div className="absolute left-10 h-72 w-48 -rotate-12 transform overflow-hidden rounded-2xl border border-neutral-800 brightness-75 shadow-2xl">
        <img
          src="https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&q=80&w=400"
          alt="Story 1"
          className="h-full w-full object-cover"
        />
        <div className="absolute -left-4 bottom-16 animate-bounce text-3xl">
          ❤️
        </div>
      </div>

      <div className="absolute right-10 h-64 w-44 rotate-12 transform overflow-hidden rounded-2xl border border-neutral-800 brightness-90 shadow-2xl">
        <img
          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400"
          alt="Story 3"
          className="h-full w-full object-cover"
        />
        <div className="absolute -right-2 top-8 rounded-full bg-green-500 p-1.5 shadow-md">
          <svg
            className="h-4 w-4 text-white"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </div>
      </div>

      <div className="relative z-10 h-96 w-60 overflow-hidden rounded-3xl border-4 border-neutral-900 bg-neutral-950 shadow-2xl">
        <img
          src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=500"
          alt="Main Story"
          className="h-full w-full object-cover"
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
        <img
          src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150"
          alt="Avatar"
          className="h-full w-full rounded-full object-cover"
        />
      </div>
    </div>
  );
}
