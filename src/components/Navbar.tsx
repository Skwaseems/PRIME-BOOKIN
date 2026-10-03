"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Menu, ShoppingCart, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { categories } from "@/data/categories";
import ThemeToggle from "@/components/ThemeToggle";
import GoogleIcon from "@/components/GoogleIcon";
import Wordmark from "@/components/Wordmark";

const navLinks = [
  { label: "Services", href: "/#services", match: "/services" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "Partner with us", href: "/#partner" },
];

export default function Navbar() {
  const { user, loading, signInWithGoogle, signOutUser } = useAuth();
  const { itemCount } = useCart();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close the profile menu on outside click or Escape.
  useEffect(() => {
    if (!profileOpen) return;
    const onPointer = (e: PointerEvent) => {
      if (!profileRef.current?.contains(e.target as Node))
        setProfileOpen(false);
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

  // The mobile menu covers the page: lock scroll behind it and close on Escape.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  // Hairline border only once the page has scrolled under the header.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const cartLabel =
    itemCount > 0
      ? `Cart, ${itemCount} item${itemCount > 1 ? "s" : ""}`
      : "Cart";
  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <header
        className={`sticky top-0 z-50 border-b bg-background/90 backdrop-blur-md transition-colors duration-300 supports-[backdrop-filter]:bg-background/80 ${
          scrolled || menuOpen ? "border-border" : "border-transparent"
        }`}
      >
        <nav
          aria-label="Main"
          className="container-page flex h-[68px] items-center justify-between gap-2"
        >
          <div className="flex items-center gap-10">
            <Link
              href="/"
              aria-label="Prime Bookin home"
              onClick={closeMenu}
              className="flex min-h-11 items-center rounded-md"
            >
              <Wordmark />
            </Link>
            <ul className="hidden items-center gap-7 md:flex">
              {navLinks.map((link) => {
                const current = link.match
                  ? pathname.startsWith(link.match)
                  : false;
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      aria-current={current ? "page" : undefined}
                      className="link-draw py-2 text-sm font-medium aria-[current=page]:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="flex items-center sm:gap-1">
            <Link
              href="/cart"
              aria-label={cartLabel}
              aria-current={pathname === "/cart" ? "page" : undefined}
              onClick={closeMenu}
              className="btn btn-icon btn-ghost relative text-foreground/75 aria-[current=page]:bg-subtle aria-[current=page]:text-foreground"
            >
              <ShoppingCart size={20} strokeWidth={1.75} aria-hidden="true" />
              {itemCount > 0 && (
                <span
                  key={itemCount}
                  aria-hidden="true"
                  className="animate-rise absolute right-1 top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-accent px-1 text-[11px] font-semibold tabular-nums text-white [animation-duration:.35s]"
                >
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </Link>
            <ThemeToggle />

            {!loading && !user && (
              <button
                onClick={signInWithGoogle}
                className="btn btn-sm btn-secondary ml-2 hidden sm:inline-flex"
              >
                <GoogleIcon size={16} />
                Sign in
              </button>
            )}

            {user && (
              <div className="relative ml-1" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen((v) => !v)}
                  aria-haspopup="menu"
                  aria-expanded={profileOpen}
                  aria-label="Account menu"
                  className="flex h-11 cursor-pointer items-center gap-2 rounded-full px-1.5 transition-colors hover:bg-subtle sm:pr-3"
                >
                  {user.photoURL ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.photoURL}
                      alt=""
                      width={28}
                      height={28}
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
                    className="panel animate-slide-down absolute right-0 mt-2 w-60 p-1.5 shadow-float"
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
                      className="flex h-11 w-full cursor-pointer items-center gap-2 rounded-lg px-3 text-left text-sm font-medium transition-colors hover:bg-subtle"
                    >
                      <LogOut size={15} aria-hidden="true" /> Sign out
                    </button>
                  </div>
                )}
              </div>
            )}

            <button
              className="btn btn-icon btn-ghost text-foreground/75 md:hidden"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
            >
              {menuOpen ? (
                <X size={20} strokeWidth={1.75} aria-hidden="true" />
              ) : (
                <Menu size={20} strokeWidth={1.75} aria-hidden="true" />
              )}
            </button>
          </div>
        </nav>
      </header>

      {/* Rendered outside <header>: its backdrop-filter would otherwise become
          the containing block for this fixed panel and clip it. */}
      {menuOpen && (
        <div
          id="mobile-nav"
          className="fixed inset-x-0 top-[68px] bottom-0 z-50 flex flex-col overflow-y-auto border-t border-border bg-background md:hidden"
        >
          <nav aria-label="Mobile" className="container-page flex-1 pt-2">
            <ul>
              {navLinks.map((link, index) => (
                <li
                  key={link.href}
                  className="animate-slide-down"
                  style={{ animationDelay: `${index * 40}ms` }}
                >
                  <Link
                    href={link.href}
                    onClick={closeMenu}
                    className="display flex min-h-16 items-center border-b border-border text-[26px] tracking-[-0.02em]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li
                className="animate-slide-down"
                style={{ animationDelay: "120ms" }}
              >
                <Link
                  href="/cart"
                  onClick={closeMenu}
                  className="display flex min-h-16 items-center justify-between border-b border-border text-[26px] tracking-[-0.02em]"
                >
                  Cart
                  {itemCount > 0 && (
                    <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-accent px-2 font-sans text-[13px] font-semibold tracking-normal text-white tabular-nums">
                      {itemCount}
                    </span>
                  )}
                </Link>
              </li>
            </ul>

            <div
              className="animate-slide-down mt-7"
              style={{ animationDelay: "160ms" }}
            >
              <p className="eyebrow">Jump to</p>
              <ul className="mt-3 grid grid-cols-2 gap-2">
                {categories.map((category) => (
                  <li key={category.slug}>
                    <Link
                      href={`/services/${category.slug}`}
                      onClick={closeMenu}
                      aria-current={
                        pathname === `/services/${category.slug}`
                          ? "page"
                          : undefined
                      }
                      className="flex min-h-12 items-center rounded-full border border-border bg-surface px-4 text-sm font-medium aria-[current=page]:border-foreground"
                    >
                      {category.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          {!loading && !user && (
            <div className="container-page border-t border-border py-4">
              <button
                onClick={() => {
                  closeMenu();
                  signInWithGoogle();
                }}
                className="btn btn-lg btn-secondary w-full"
              >
                <GoogleIcon size={18} />
                Continue with Google
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
