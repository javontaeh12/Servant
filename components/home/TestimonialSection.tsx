"use client";

import { useState, useEffect } from "react";
import { TESTIMONIALS } from "@/lib/constants";

export default function TestimonialSection() {
  const [current, setCurrent] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % TESTIMONIALS.length);
        setFade(true);
      }, 300);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-24 md:py-32 px-6 sm:px-8 bg-sky">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16 md:mb-20">
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold mb-5 text-slate-text">
            Client Experiences
          </h2>
          <div className="w-[60px] h-[2px] bg-primary mx-auto mb-5" />
          <p className="text-base md:text-lg max-w-2xl mx-auto leading-relaxed text-slate-muted">
            Hear from the people who trusted us with their most important moments.
          </p>
        </div>

        <div className="relative min-h-[280px] flex items-center justify-center">
          <div
            className={`text-center px-4 transition-all duration-300 ${
              fade ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            }`}
          >
            <div className="text-primary/20 font-heading text-8xl leading-none mb-4 select-none">
              &ldquo;
            </div>
            <p className="text-slate-text/70 text-lg md:text-xl font-body italic leading-relaxed mb-8 max-w-3xl mx-auto -mt-8">
              {TESTIMONIALS[current].quote}
            </p>
            <div className="flex flex-col items-center gap-1">
              <div className="w-8 h-[1px] bg-primary mb-3" />
              <p className="text-primary font-heading font-bold text-base">
                {TESTIMONIALS[current].name}
              </p>
              <p className="text-slate-muted text-sm tracking-wide">
                {TESTIMONIALS[current].event}
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-3 mt-10">
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setFade(false);
                setTimeout(() => {
                  setCurrent(i);
                  setFade(true);
                }, 300);
              }}
              className={`transition-all duration-300 rounded-full ${
                i === current
                  ? "w-8 h-2 bg-primary"
                  : "w-2 h-2 bg-primary/20 hover:bg-primary/40"
              }`}
              aria-label={`Testimonial ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
