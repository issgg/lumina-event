import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

function reduceMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function useDesplazamientoSuave() {
  useEffect(() => {
    if (reduceMotion()) return undefined;

    const lenis = new Lenis({
      duration: 1.05,
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.2,
    });
    const actualizar = (tiempo) => lenis.raf(tiempo * 1000);

    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(actualizar);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(actualizar);
      lenis.destroy();
      gsap.ticker.lagSmoothing(500, 33);
    };
  }, []);
}

export function useRevelados(ref) {
  useEffect(() => {
    if (!ref.current || reduceMotion()) return undefined;

    const contexto = gsap.context(() => {
      gsap.utils.toArray("[data-hero]").forEach((elemento) => {
        gsap.fromTo(
          elemento,
          { opacity: 0, y: 42, filter: "blur(10px)" },
          { opacity: 1, y: 0, filter: "blur(0px)", duration: 1.1, ease: "expo.out", delay: 0.1 },
        );
      });

      gsap.utils.toArray("[data-reveal]").forEach((elemento, indice) => {
        gsap.fromTo(
          elemento,
          { opacity: 0, y: 28, filter: "blur(8px)" },
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.85,
            ease: "expo.out",
            delay: (indice % 4) * 0.05,
            scrollTrigger: { trigger: elemento, start: "top 90%", once: true },
          },
        );
      });
    }, ref);

    return () => contexto.revert();
  }, [ref]);
}
