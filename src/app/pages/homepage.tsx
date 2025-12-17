"use client";

import React from "react";
import Footer from "@/components/layout/footer";
import Header from "@/components/layout/header";
import Blog from "@/components/organisms/homepage/blog";
import Community from "@/components/organisms/homepage/community";
import Features from "@/components/organisms/homepage/features";
import Hero from "@/components/organisms/homepage/hero";
import OnboardingCard from "@/components/organisms/homepage/onboarding-card";
import Stats from "@/components/organisms/homepage/stats";
import type { HomepageConfig } from "@/configs/homepage-config";

interface HomepageProps {
  config: HomepageConfig;
}

export default function Homepage({ config }: HomepageProps) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header company={config.company} />
      <main className="flex-grow">
        <Hero config={config.hero} />
        <OnboardingCard
          variant="elegant"
          size="xl"
          display="split"
          features={[
            "Get started in under 5 minutes with our guided onboarding",
            "No credit card required during your 14-day free trial period",
            "Access to all premium features during trial",
            "24/7 customer support via chat, email, and phone",
            "Cancel anytime with no questions asked",
            "Data export available at any time",
          ]}
        />
        <Stats config={config.stats} />
        <Features config={config.features} />
        <Blog config={config.blog} />
        <Community config={config.community} />
      </main>
      <Footer company={config.company} />
    </div>
  );
}
