"use client";

import Image from "next/image";

/**
 * Hero Banner Component
 *
 * Reference: docs/old-code/app/Home.module.scss lines 16-45
 * - Desktop image height: 408px
 * - Mobile image height: 332px
 * - Background: theme-aware light variant
 */
export function HeroBanner() {
  return (
    <section className="bg-[#f0f7f4]">
      <div className="hero-image">
        {/* Desktop Banner */}
        <div className="hidden md:block h-[408px] relative">
          <Image
            src="/images/banner.png"
            alt="Fin Zone Banner"
            fill
            className="object-contain"
            priority
          />
        </div>

        {/* Mobile Banner */}
        <div className="block md:hidden h-[332px] relative">
          <Image
            src="/images/banner-mobile.png"
            alt="Fin Zone Banner"
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>
    </section>
  );
}
