import { useScrollReveal } from "@/hooks/useScrollReveal";

interface RevealProps {
  children: React.ReactNode;
  direction?: "up" | "left" | "right";
  delay?: number;
  className?: string;
}

const Reveal = ({ children, direction = "up", delay = 0, className = "" }: RevealProps) => {
  const { ref, isVisible } = useScrollReveal(0.15);

  const animationClass = {
    up: "animate-reveal-up",
    left: "animate-reveal-left",
    right: "animate-reveal-right",
  }[direction];

  return (
    <div
      ref={ref}
      className={`${className} ${isVisible ? animationClass : "opacity-0"}`}
      style={{ animationDelay: isVisible ? `${delay}ms` : undefined }}
    >
      {children}
    </div>
  );
};

export default Reveal;
