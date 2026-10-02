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
    <section id="how-it-works" className="border-t border-border">
      <div className="container-page py-16">
        <h2 className="text-2xl font-semibold tracking-tight">How it works</h2>

        <ol className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-3">
          {steps.map((step, index) => (
            <li key={step.title} className="flex gap-4">
              <span
                aria-hidden="true"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-sm font-semibold tabular-nums"
              >
                {index + 1}
              </span>
              <div>
                <h3 className="font-semibold">{step.title}</h3>
                <p className="mt-1 text-sm text-muted">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
