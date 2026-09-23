import React from "react";
import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  variant?: "full" | "mark";
  size?: "sm" | "md" | "lg" | "xl" | number;
  className?: string;
  href?: string;
  priority?: boolean;
}

export function Logo({
  variant = "full",
  size = "md",
  className = "",
  href,
  priority = false,
}: LogoProps) {
  // Height in pixels
  let height = 36;
  if (typeof size === "number") {
    height = size;
  } else {
    switch (size) {
      case "sm":
        height = 28;
        break;
      case "md":
        height = 36;
        break;
      case "lg":
        height = 44;
        break;
      case "xl":
        height = 54;
        break;
    }
  }

  // Full lockup is 938x146 (aspect ratio ~ 6.425)
  // Mark is 147x146 (aspect ratio ~ 1.0)
  const isFull = variant === "full";
  const width = isFull ? Math.round(height * 6.425) : height;
  const src = isFull ? "/images/logo-full.png" : "/images/logo-mark.png";

  const content = (
    <div
      className={`relative inline-flex items-center shrink-0 transition-transform duration-200 group-hover:scale-105 ${className}`}
      style={{ width, height }}
    >
      <Image
        src={src}
        alt="MANBRO Logo"
        width={width}
        height={height}
        className="w-full h-full object-contain"
        priority={priority}
      />
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center group">
        {content}
      </Link>
    );
  }

  return content;
}

export default Logo;
