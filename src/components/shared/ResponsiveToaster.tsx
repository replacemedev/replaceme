"use client";

import { useEffect, useState } from "react";
import { Toaster } from "sonner";

export function ResponsiveToaster() {
  const [position, setPosition] = useState<"top-center" | "top-right">("top-right");

  useEffect(() => {
    const media = window.matchMedia("(max-width: 768px)");
    const handleResize = () => {
      setPosition(media.matches ? "top-center" : "top-right");
    };
    handleResize();
    media.addEventListener("change", handleResize);
    return () => media.removeEventListener("change", handleResize);
  }, []);

  return (
    <Toaster
      position={position}
      richColors
      closeButton
      offset={{ top: "calc(16px + env(safe-area-inset-top))", right: 16, left: 16 }}
      mobileOffset={{ top: "calc(16px + env(safe-area-inset-top))", right: 16, left: 16, bottom: 16 }}
      toastOptions={{
        className: "w-[calc(100vw-2rem)] mx-auto max-w-sm md:max-w-md md:w-full md:mx-0",
      }}
    />
  );
}
