import Blog from "@/components/organisms/homepage/blog";
import Community from "@/components/organisms/homepage/community";
import Features from "@/components/organisms/homepage/features";
import Footer from "@/components/organisms/footer";
import Header from "@/components/organisms/header";
import Hero from "@/components/organisms/homepage/hero";
import Stats from "@/components/organisms/homepage/stats";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <Hero />
      <Stats />
      <Features />
      <Blog />
      <Community />
      <Footer />
    </main>
  );
}
