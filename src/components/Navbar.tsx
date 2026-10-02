"use client";

import { useState } from "react";
import Link from "next/link";
import { LogOut, Menu, ShoppingCart, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import ThemeToggle from "@/components/ThemeToggle";
import GoogleIcon from "@/components/GoogleIcon";

const navLinks = [
  { label: "Services", href: "/#services" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "Partner with us", href: "/#partner" },
];

export default function Navbar() {
  const { user, loading, signInWithGoogle, signOutUser } = useAuth();
  const { itemCount } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuOpenProfile, setMenuOpenProfile] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full px-4 pt-4">
      <nav className="glass mx-auto flex max-w-6xl items-center justify-between rounded-2xl px-5 py-3 shadow-lg shadow-black/5">
        <Link href="/" className="font-display text-lg font-bold tracking-tight">
          Prime<span className="text-gradient">Bookin</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/cart"
            aria-label="Cart"
            className="glass relative flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-transform hover:scale-105 active:scale-95"
          >
            <ShoppingCart size={18} />
            {itemCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[11px] font-bold text-white">
                {itemCount}
              </span>
            )}
          </Link>
          <ThemeToggle />

          {!loading && !user && (
            <button
              onClick={signInWithGoogle}
              className="flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-accent/30 transition-transform hover:scale-[1.03] active:scale-95"
            >
              <GoogleIcon size={16} />
              <span className="hidden sm:inline">Sign in</span>
            </button>
          )}

          {user && (
            <div className="relative">
              <button
                onClick={() => setMenuOpenProfile((v) => !v)}
                className="flex items-center gap-2 rounded-full glass py-1 pl-1 pr-3"
              >
                {user.photoURL ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.photoURL}
                    alt={user.displayName ?? "User"}
                    className="h-8 w-8 rounded-full"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-sm font-semibold text-white">
                    {user.displayName?.[0] ?? "U"}
                  </div>
                )}
                <span className="hidden max-w-[100px] truncate text-sm font-medium sm:inline">
                  {user.displayName?.split(" ")[0]}
                </span>
              </button>

              {menuOpenProfile && (
                <div className="glass absolute right-0 mt-2 w-48 rounded-xl p-2 shadow-xl">
                  <div className="px-2 py-1.5 text-xs text-muted truncate">
                    {user.email}
                  </div>
                  <button
                    onClick={() => {
                      setMenuOpenProfile(false);
                      signOutUser();
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-foreground hover:bg-surface-border"
                  >
                    <LogOut size={15} /> Sign out
                  </button>
                </div>
              )}
            </div>
          )}

          <button
            className="glass flex h-10 w-10 items-center justify-center rounded-full md:hidden"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="glass mx-auto mt-2 flex max-w-6xl flex-col gap-1 rounded-2xl p-3 md:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted hover:bg-surface-border hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
