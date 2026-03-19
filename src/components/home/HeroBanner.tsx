"use client";

import Image from "next/image";
import { useTenant } from "@/hooks/tenant/use-tenant";

export function HeroBanner() {
  const tenant = useTenant();

  return (
    <section
      className="relative w-full h-auto overflow-hidden"
      style={{ backgroundColor: "#f2f8f6" }} // $bg-300 from old code
    >
      <div className="w-full mx-auto">
        <div className="relative w-full">
          {/* Desktop Banner - 408px height */}
          <div className="hidden md:block relative w-full h-[408px]">
            <Image
              src="/images/banner.png"
              alt={`${tenant.name} Banner`}
              fill
              className="object-contain"
              style={{ margin: "auto" }}
              priority
            />
          </div>

          {/* Mobile Banner - 332px height */}
          <div className="block md:hidden relative w-full h-[332px]">
            <Image
              src="/images/banner-mobile.png"
              alt={`${tenant.name} Banner Mobile`}
              fill
              className="object-contain"
              style={{ margin: "auto" }}
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
