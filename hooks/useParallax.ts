import { useEffect, useState } from "react";

export function useParallax(multiplier = 0.3) {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setOffset(0);
      return;
    }
    const handleScroll = () => {
      setOffset(window.scrollY * multiplier);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [multiplier]);

  return offset;
}
