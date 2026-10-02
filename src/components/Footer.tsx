import { Mail, Store } from "lucide-react";

export default function Footer() {
  return (
    <footer id="partner" className="px-4 pb-10 pt-6">
      <div className="glass mx-auto flex max-w-6xl flex-col gap-6 rounded-3xl p-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-display text-lg font-bold tracking-tight">
            Prime<span className="text-gradient">Bookin</span>
          </p>
          <p className="mt-2 max-w-sm text-sm text-muted">
            Cabs, hotels, food, medicines and groceries from every local
            store — one premium cart, one checkout.
          </p>
        </div>

        <div className="flex flex-col gap-3 text-sm">
          <a
            href="mailto:primebookin.com@gmail.com"
            className="flex items-center gap-2 text-muted transition-colors hover:text-foreground"
          >
            <Mail size={15} /> primebookin.com@gmail.com
          </a>
          <a
            href="mailto:primebookin.com@gmail.com?subject=Partner%20with%20Prime%20Bookin"
            className="flex items-center gap-2 font-semibold text-accent"
          >
            <Store size={15} /> Register your store
          </a>
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-muted">
        © {new Date().getFullYear()} Prime Bookin. www.primebookin.in
      </p>
    </footer>
  );
}
