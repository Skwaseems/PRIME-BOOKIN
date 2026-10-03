import Link from "next/link";
import { ArrowRight } from "lucide-react";

const steps = [
  {
    title: "Sign in with Google",
    description: "One tap with your Google account. No forms, no passwords.",
  },
  {
    title: "Build your cart",
    description:
      "Add a cab, a hotel stay, medicines and groceries from different local stores at once.",
  },
  {
    title: "Check out once",
    description:
      "Enter your delivery address, pay on delivery, and every store gets its part of the order.",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-title"
      className="bg-night text-night-foreground"
    >
      <div className="container-page py-[clamp(64px,9vw,120px)]">
        <div data-reveal className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-[560px]">
            <p className="text-[13px] font-semibold tracking-[0.08em] text-night-accent uppercase">
              How it works
            </p>
            <h2 id="how-title" className="section-heading mt-3.5 text-white">
              Three steps, one checkout.
            </h2>
          </div>
          <Link href="/#services" className="btn btn-lg btn-primary">
            Start an order
            <ArrowRight size={16} aria-hidden="true" className="icon-nudge" />
          </Link>
        </div>

        <ol className="mt-12 grid grid-cols-1 gap-x-12 gap-y-8 sm:mt-16 md:grid-cols-3">
          {steps.map((step, index) => (
            <li
              key={step.title}
              data-reveal
              style={{ transitionDelay: `${index * 90}ms` }}
              className="flex gap-4 border-t border-night-border pt-5 md:block md:pt-7"
            >
              <span
                aria-hidden="true"
                className="display w-6 shrink-0 text-[32px] leading-none tracking-[-0.04em] text-night-accent md:block md:w-auto md:text-[56px]"
              >
                {index + 1}
              </span>
              <div>
                <h3 className="display text-lg leading-tight text-white md:mt-6 md:text-[21px]">
                  {step.title}
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-night-muted">
                  {step.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
