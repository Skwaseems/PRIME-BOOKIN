import Link from "next/link";
import { ArrowRight } from "lucide-react";
import AmbientVideo from "@/components/AmbientVideo";
import { showcaseVideo } from "@/data/media";

export default function Showcase() {
  return (
    <section aria-labelledby="showcase-title" className="pb-[clamp(64px,9vw,128px)]">
      <div className="scroll-expand relative isolate h-[min(78vh,760px)] min-h-[440px] overflow-hidden bg-night">
        <AmbientVideo video={showcaseVideo} label="Video of local shops and streets" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/10"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0">
          <div className="container-page pb-10 sm:pb-14">
            <div data-reveal className="pointer-events-auto max-w-[620px] pr-14">
              <p className="text-[13px] font-semibold tracking-[0.08em] text-night-accent uppercase">
                Around town
              </p>
              <h2
                id="showcase-title"
                className="section-heading mt-3.5 text-white"
              >
                From the cab stand to the corner pharmacy.
              </h2>
              <p className="mt-4 max-w-md text-base leading-relaxed text-white/80">
                The places you already rely on, gathered into one cart and one
                checkout.
              </p>
              <Link href="/#services" className="btn btn-lg btn-primary mt-7">
                Browse services
                <ArrowRight size={16} aria-hidden="true" className="icon-nudge" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
