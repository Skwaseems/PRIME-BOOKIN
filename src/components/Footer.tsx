import { Mail, Store } from "lucide-react";
import Wordmark from "@/components/Wordmark";

export default function Footer() {
  return (
    <footer id="partner" className="border-t border-border bg-surface">
      <div className="container-page flex flex-col gap-8 py-10 sm:flex-row sm:justify-between">
        <div className="max-w-sm">
          <Wordmark />
          <p className="mt-2 text-sm text-muted">
            Cabs, hotels, food, medicines and groceries from local stores, in
            one cart and one checkout.
          </p>
        </div>

        <div>
          <h2 className="eyebrow">Partner with us</h2>
          <ul className="mt-3 flex flex-col gap-2 text-sm">
            <li>
              <a
                href="mailto:primebookin.com@gmail.com?subject=Partner%20with%20Prime%20Bookin"
                className="link inline-flex items-center gap-2"
              >
                <Store size={15} aria-hidden="true" /> Register your store
              </a>
            </li>
            <li>
              <a
                href="mailto:primebookin.com@gmail.com"
                className="inline-flex items-center gap-2 text-muted hover:text-foreground"
              >
                <Mail size={15} aria-hidden="true" /> primebookin.com@gmail.com
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <p className="container-page py-4 text-xs text-muted">
          © {new Date().getFullYear()} Prime Bookin · www.primebookin.in
        </p>
      </div>
    </footer>
  );
}
