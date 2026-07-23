import Image from "next/image";
import Link from "next/link";
import MobileMenu from "@/components/MobileMenu";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Roadmap", href: "/roadmap" },
  { label: "Referral", href: "/referral" },
  { label: "Community", href: "/community" },
  { label: "Updates", href: "/updates" },
];

export default function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-border-subtle bg-bg-void/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5 text-lg font-semibold tracking-tight text-text-primary">
          <Image
            src="/images/shield.jpg"
            alt=""
            width={36}
            height={36}
            className="rounded-md"
            priority
          />
          Vaultor
        </Link>
        <ul className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-sm text-text-secondary transition-colors hover:text-text-primary"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
        <MobileMenu links={NAV_LINKS} />
      </nav>
    </header>
  );
}
