import React, { ReactNode, useState } from "react";

type ThemeToggleCircularProps = {
  children: ReactNode;
  onToggle: () => void;
  theme: string | undefined;
  className: string;
  speed: number;
  blur: number;
};

export function ThemeToggleCircular({
  children,
  onToggle,
  theme,
  className,
  speed = 0.5,
  blur = 0,
  ...props
}: Partial<ThemeToggleCircularProps>) {
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    if (isTransitioning) return;
    if (!document.startViewTransition) {
      onToggle?.();
      return;
    }

    setIsTransitioning(true);

    const themeAnchor = document.querySelector("#theme-anchor");
    const { x, y, width, height } = themeAnchor!.getBoundingClientRect();

    const clientX = x + width / 2;
    const clientY = y + height / 2;

    const isDark = document.documentElement.classList.contains("dark");
    const targetTheme = isDark ? "to-light" : "to-dark";

    document.documentElement.style.setProperty("--x", `${clientX}px`);
    document.documentElement.style.setProperty("--y", `${clientY}px`);
    document.documentElement.style.setProperty(
      "--transition-speed",
      `${speed}s`,
    );
    document.documentElement.style.setProperty(
      "--transition-blur",
      `${blur}px`,
    );

    document.documentElement.setAttribute("data-theme-transition", targetTheme);

    try {
      const transition = document.startViewTransition(() => {
        onToggle?.();
      });

      await transition.finished;
    } catch (error) {
      console.log("Theme transition error: ", error);
    } finally {
      document.documentElement.removeAttribute("data-theme-transition");
      setIsTransitioning(false);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={className}
      style={{ pointerEvents: isTransitioning ? "none" : "auto" }}
      {...props}
    >
      {children}
    </div>
  );
}
