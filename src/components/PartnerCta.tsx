import { siteConfig } from "@/lib/site";

export default function PartnerCta() {
  return (
    <section id="partner" aria-labelledby="partner-title">
      <div className="container-page py-[clamp(64px,8vw,112px)]">
        <div
          data-reveal
          className="panel flex flex-wrap items-center justify-between gap-8 p-[clamp(24px,4vw,56px)]"
        >
          <div className="min-w-0 flex-[1_1_420px]">
            <p className="eyebrow-accent">Partner with us</p>
            <h2
              id="partner-title"
              className="display mt-3.5 text-[clamp(1.625rem,3vw,2.25rem)] leading-[1.1] tracking-[-0.025em] text-balance"
            >
              Run a cab service, hotel, cafe or shop?
            </h2>
            <p className="mt-3.5 max-w-xl text-base leading-relaxed text-body">
              Register your store with {siteConfig.name} and receive your part
              of every order placed with you.
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <a
              href={`mailto:${siteConfig.email}?subject=Partner%20with%20Prime%20Bookin`}
              className="btn btn-lg btn-primary"
            >
              Register your store
            </a>
            <a href={`mailto:${siteConfig.email}`} className="btn btn-lg btn-secondary">
              Email us
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
