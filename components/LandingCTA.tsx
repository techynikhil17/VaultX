"use client";
import { useRouter } from "next/navigation";

export function LandingCTA() {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center gap-3 flex-wrap">
      <button
        className="btn-primary px-7 py-3 text-base shadow-glow"
        onMouseDown={() => router.push("/signup")}
        onTouchStart={() => router.push("/signup")}
      >
        Start for free →
      </button>
      <button
        className="btn-secondary px-7 py-3 text-base"
        onMouseDown={() => router.push("/login")}
        onTouchStart={() => router.push("/login")}
      >
        Sign in
      </button>
    </div>
  );
}

export function NavCTA() {
  const router = useRouter();

  return (
    <div className="flex items-center gap-3">
      <button
        className="btn-ghost text-sm"
        onMouseDown={() => router.push("/login")}
        onTouchStart={() => router.push("/login")}
      >
        Sign in
      </button>
      <button
        className="btn-primary text-sm"
        onMouseDown={() => router.push("/signup")}
        onTouchStart={() => router.push("/signup")}
      >
        Get started free
      </button>
    </div>
  );
}
