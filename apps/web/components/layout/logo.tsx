import Image from "next/image";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Image
      src="/kewage-logo-green-removebg-preview.png"
      alt="KEWAGE"
      width={600}
      height={338}
      className={cn(
        "w-auto object-contain [filter:saturate(0.72)_hue-rotate(20deg)_brightness(0.95)] dark:[filter:saturate(0.9)_hue-rotate(20deg)_brightness(1.6)]",
        className,
      )}
    />
  );
}
