"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Menu, ShoppingCart, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import ThemeToggle from "@/components/ThemeToggle";
import GoogleIcon from "@/components/GoogleIcon";
import Wordmark from "@/components/Wordmark";

const navLinks = [
  { label: "Services", href: "/#services" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "Partner with us", href: "/#partner" },
];

export default function Navbar() {
  const { user, loading, signInWithGoogle, signOutUser } = useAuth();
  const { itemCount } = useCart();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close the profile menu on outside click or Escape.
  useEffect(() => {
    if (!profileOpen) return;
    const onPointer = (e: PointerEvent) => {
      if (!profileRef.current?.contains(e.target as Node)) setProfileOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setProfileOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [profileOpen]);

  const cartLabel =
    itemCount > 0 ? `Cart, ${itemCount} item${itemCount > 1 ? "s" : ""}` : "Cart";

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/80">
      <nav
        aria-label="Main"
        className="container-page flex h-16 items-center justify-between gap-4"
      >
        <div className="flex items-center gap-8">
          <Link href="/" aria-label="Prime Bookin home">
            <Wordmark />
          </Link>
          <ul className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="btn btn-sm btn-ghost">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/cart"
            aria-label={cartLabel}
            aria-current={pathname === "/cart" ? "page" : undefined}
            className="btn btn-icon btn-ghost relative"
          >
            <ShoppingCart size={18} aria-hidden="true" />
            {itemCount > 0 && (
              <span
                aria-hidden="true"
                className="absolute right-0.5 top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-accent px-1 text-[11px] font-semibold tabular-nums text-white"
              >
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            )}
          </Link>
          <ThemeToggle />

          {!loading && !user && (
            <button
              onClick={signInWithGoogle}
              aria-label="Sign in with Google"
              className="btn btn-sm btn-secondary h-9 max-[379px]:w-9 max-[379px]:px-0"
            >
              <GoogleIcon size={16} />
              <span className="max-[379px]:sr-only">Sign in</span>
            </button>
          )}

          {user && (
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={profileOpen}
                aria-label="Account menu"
                className="flex h-10 items-center gap-2 rounded-md px-1.5 hover:bg-subtle sm:pr-3"
              >
                {user.photoURL ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.photoURL}
                    alt=""
                    className="h-7 w-7 rounded-full"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-subtle text-xs font-semibold">
                    {user.displayName?.[0] ?? "U"}
                  </span>
                )}
                <span className="hidden max-w-[120px] truncate text-sm font-medium sm:inline">
                  {user.displayName?.split(" ")[0]}
                </span>
              </button>

              {profileOpen && (
                <div
                  role="menu"
                  className="panel absolute right-0 mt-1 w-56 p-1 shadow-lg"
                >
                  <div className="truncate px-3 py-2 text-xs text-muted">
                    {user.email}
                  </div>
                  <button
                    role="menuitem"
                    onClick={() => {
                      setProfileOpen(false);
                      signOutUser();
                    }}
                    className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm hover:bg-subtle"
                  >
                    <LogOut size={15} aria-hidden="true" /> Sign out
                  </button>
                </div>
              )}
            </div>
          )}

          <button
            className="btn btn-icon btn-ghost md:hidden"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {menuOpen && (
        <ul
          id="mobile-nav"
          className="container-page flex flex-col border-t border-border py-2 md:hidden"
        >
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block rounded-md px-3 py-3 text-sm font-medium hover:bg-subtle"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </header>
  );
}
