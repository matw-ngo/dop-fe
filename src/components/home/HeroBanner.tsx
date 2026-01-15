"use client";

import Image from "next/image";
import { useTenant } from "@/hooks/use-tenant";

export function HeroBanner() {
  const tenant = useTenant();

  return (
    <section
      className="relative w-full h-auto overflow-hidden"
      style={{ backgroundColor: "#f0f7f4" }} // Specific to legacy feel
    >
      <div className="max-w-full mx-auto px-0">
        <div className="relative w-full h-[220px] md:h-[450px]">
          {/* Desktop Banner */}
          <div className="hidden md:block absolute inset-0">
            <Image
              src="/images/banner.png"
              alt={`${tenant.name} Banner`}
              fill
              className="object-contain object-right"
              priority
            />
          </div>

          {/* Mobile Banner */}
          <div className="block md:hidden absolute inset-0">
            <Image
              src="/images/banner-mobile.png"
              alt={`${tenant.name} Banner Mobile`}
              fill
              className="object-contain object-bottom"
              priority
            />
          </div>

          {/* Desktop Slogan/Text overlay if needed could go here, 
              but in legacy it was part of the image */}
        </div>
      </div>
    </section>
  );
}
