"use client";

import React from "react";
import Header from "@/components/organisms/header";
import Footer from "@/components/organisms/footer";
import Hero from "@/components/organisms/homepage/hero";
import Stats from "@/components/organisms/homepage/stats";
import Features from "@/components/organisms/homepage/features";
import Blog from "@/components/organisms/homepage/blog";
import Community from "@/components/organisms/homepage/community";
import { HomepageConfig } from "@/configs/homepage-config";

interface HomepageProps {
  config: HomepageConfig;
}

export default function Homepage({ config }: HomepageProps) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header company={config.company} />
      <main className="flex-grow">
        <Hero config={config.hero} />
        <Stats config={config.stats} />
        <Features config={config.features} />
        <Blog config={config.blog} />
        <Community config={config.community} />
      </main>
      <Footer company={config.company} />
    </div>
  );
}
