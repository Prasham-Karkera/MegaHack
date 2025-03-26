"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export const PageTransition = ({ children }) => {
  const pageRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        pageRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <div ref={pageRef} className="w-full h-full">
      {children}
    </div>
  );
};

export default PageTransition;
