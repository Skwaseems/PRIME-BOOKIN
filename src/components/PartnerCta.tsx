import SmartImage from "@/components/SmartImage";
import { partnerImage } from "@/data/media";
import { siteConfig } from "@/lib/site";

export default function PartnerCta() {
  return (
    <section id="partner" aria-labelledby="partner-title">
      <div className="container-page py-[clamp(64px,8vw,112px)]">
        <div className="panel group grid overflow-hidden md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <div
            data-reveal
            className="media-reveal relative aspect-[16/10] overflow-hidden bg-subtle md:aspect-auto md:min-h-[360px]"
          >
            <div className="absolute inset-0 transition-transform duration-[1.2s] ease-(--ease-out) group-hover:scale-105">
              <SmartImage
                image={partnerImage}
                sizes="(min-width: 768px) 40vw, 100vw"
                fallbackLabel="Partner photo"
              />
            </div>
          </div>
          <div
            data-reveal
            className="flex flex-col justify-center gap-8 p-[clamp(24px,4vw,56px)]"
          >
            <div>
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
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
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
      </div>
    </section>
  );
}
