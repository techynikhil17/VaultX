"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export function RouteProgress() {
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let t1: ReturnType<typeof setTimeout>;
    let t2: ReturnType<typeof setTimeout>;

    el.style.cssText = "width:0%;opacity:1;transition:none";

    const raf = requestAnimationFrame(() => {
      el.style.transition = "width 400ms cubic-bezier(0.25,0.46,0.45,0.94)";
      el.style.width = "72%";

      t1 = setTimeout(() => {
        el.style.transition = "width 150ms ease-out";
        el.style.width = "100%";
        t2 = setTimeout(() => {
          el.style.transition = "opacity 250ms ease";
          el.style.opacity = "0";
        }, 160);
      }, 600);
    });

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [pathname]);

  return (
    <div className="fixed top-0 inset-x-0 z-[999] h-[2px] pointer-events-none">
      <div
        ref={ref}
        className="h-full origin-left"
        style={{
          background: "linear-gradient(90deg, #6366f1, #8b5cf6, #a78bfa)",
          boxShadow: "0 0 8px rgba(99,102,241,0.6)",
          width: 0,
          opacity: 0,
        }}
      />
    </div>
  );
}
