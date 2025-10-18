"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const linkClass = (path: string) =>
    `px-4 py-2 transition-colors duration-200 border-b-2 ${
      pathname === path
        ? "border-[var(--accent)] font-semibold text-[var(--accent)]"
        : "border-transparent hover:border-[var(--accent)] hover:text-[var(--accent)] text-[var(--foreground)]"
    }`;

  return (
    <nav className="fixed top-0 left-0 w-full bg-[var(--background)] flex items-center px-8 h-16 z-50 border-b border-[var(--border)]">
      <div className="text-xl font-bold mr-10">
        <Link href="/" className={linkClass("/")}>
          Argumentation
        </Link>
      </div>
      <Link href="/aba" className={linkClass("/aba")}>
        ABA Generator
      </Link>
      <Link href="/relations" className={linkClass("/relations")}>
        Relation Prediction
      </Link>
      <Link href="/gradual" className={linkClass("/gradual")}>
        Gradual Semantics
      </Link>
    </nav>
  );
}
