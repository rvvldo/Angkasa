import { useEffect, useRef } from "react";
import { useInView, animate } from "framer-motion";

interface CountUpStatProps {
  value: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}

export default function CountUpStat({ 
  value, 
  suffix = "", 
  prefix = "", 
  className = "" 
}: CountUpStatProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "0px 0px -50px 0px" });

  useEffect(() => {
    if (isInView) {
      const node = ref.current;
      if (!node) return;

      const controls = animate(0, value, {
        duration: 2,
        ease: "easeOut",
        onUpdate: (latest) => {
          node.textContent = Math.floor(latest).toString();
        },
      });

      return () => controls.stop();
    }
  }, [isInView, value]);

  return (
    <span className={className}>
      {prefix}
      <span ref={ref}>0</span>
      {suffix}
    </span>
  );
}
