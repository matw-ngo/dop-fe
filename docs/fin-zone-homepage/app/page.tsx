import Header from "@/components/header";
import Hero from "@/components/hero";
import Stats from "@/components/stats";
import Features from "@/components/features";
import Blog from "@/components/blog";
import Community from "@/components/community";
import Footer from "@/components/footer";

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
