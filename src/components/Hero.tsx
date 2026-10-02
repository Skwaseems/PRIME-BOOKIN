"use client";

import { motion } from "framer-motion";
import { ArrowRight, MapPin, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import GoogleIcon from "@/components/GoogleIcon";

export default function Hero() {
  const { user, error, signInWithGoogle } = useAuth();

  return (
    <section
      id="top"
      className="bg-radial-glow relative overflow-hidden px-4 pb-20 pt-16 sm:pt-24"
    >
      <div className="mx-auto flex max-w-6xl flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass mb-6 flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium text-muted"
        >
          <Sparkles size={14} className="text-accent-2" />
          Cabs, hotels, food, medicines &amp; groceries — one cart
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-display max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl"
        >
          Everything local,
          <br />
          <span className="text-gradient">one cart away.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-5 max-w-xl text-base text-muted sm:text-lg"
        >
          Prime Bookin brings your cab, hotel, cafe, pharmacy and grocery
          store onto a single premium checkout — ordered in seconds, tracked
          in real time.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8 flex flex-col items-center gap-3 sm:flex-row"
        >
          {!user ? (
            <button
              onClick={signInWithGoogle}
              className="flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-accent/30 transition-transform hover:scale-[1.03] active:scale-95"
            >
              <GoogleIcon size={18} />
              Continue with Google
            </button>
          ) : (
            <a
              href="#services"
              className="flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-accent/30 transition-transform hover:scale-[1.03] active:scale-95"
            >
              Start ordering
              <ArrowRight size={16} />
            </a>
          )}
          <a
            href="#services"
            className="glass flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-foreground transition-transform hover:scale-[1.03] active:scale-95"
          >
            <MapPin size={16} />
            Explore services
          </a>
        </motion.div>

        {error && (
          <p className="mt-3 max-w-sm text-sm text-red-500">{error}</p>
        )}

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="glass animate-float-slow mt-16 flex w-full max-w-3xl flex-col gap-4 rounded-3xl p-5 text-left shadow-2xl shadow-black/10 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted">
              Live cart preview
            </p>
            <p className="font-display mt-1 text-lg font-semibold">
              Paracetamol · Cold Coffee · Hotel Suraj
            </p>
            <p className="mt-1 text-sm text-muted">
              3 stores · 1 delivery slot · Grand total ₹1,240
            </p>
          </div>
          <div className="flex -space-x-3">
            {["🚕", "🏨", "🍔", "💊"].map((emoji, i) => (
              <div
                key={emoji}
                style={{ animationDelay: `${i * 0.4}s` }}
                className="animate-float glass flex h-12 w-12 items-center justify-center rounded-2xl text-xl"
              >
                {emoji}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
