"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const linkClass = (path: string) =>
    `px-4 py-2 transition-colors duration-200 ${
      pathname === path ? "border-b-2 border-white font-semibold" : "hover:text-gray-300"
    }`;

  return (
    <nav className="fixed top-0 left-0 w-full bg-gray-900 text-white flex items-center px-8 h-16 z-50">
      <div className="text-xl font-bold mr-10">
        <Link href="/" className={linkClass("/")}>
          Argumentation
        </Link>
      </div>
      <Link href="/relations" className={linkClass("/relations")}>
        Relation Prediction
      </Link>
      <Link href="/aba" className={linkClass("/aba")}>
        ABA Generator
      </Link>
    </nav>
  );
}
