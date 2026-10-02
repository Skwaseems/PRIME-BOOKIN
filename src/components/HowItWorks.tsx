"use client";

import { motion } from "framer-motion";
import { MapPinned, ShoppingBag, Smartphone } from "lucide-react";

const steps = [
  {
    icon: Smartphone,
    title: "Sign in with Gmail",
    description: "One tap with your Google account — no forms, no passwords.",
  },
  {
    icon: ShoppingBag,
    title: "Build your cart",
    description:
      "Add a cab, a hotel stay, medicines and groceries from different local stores at once.",
  },
  {
    icon: MapPinned,
    title: "Track it live",
    description:
      "Pin your delivery location and watch every order move in real time.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="px-4 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-accent">
            How it works
          </p>
          <h2 className="font-display mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Ordering, simplified
          </h2>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="card-flat relative rounded-2xl p-6 shadow-sm"
            >
              <span className="font-display text-3xl font-bold text-accent/30">
                0{index + 1}
              </span>
              <div className="mt-3 flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <step.icon size={20} />
              </div>
              <h3 className="font-display mt-4 text-lg font-semibold">
                {step.title}
              </h3>
              <p className="mt-1 text-sm text-muted">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
