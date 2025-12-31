import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { FeaturedTutors } from "@/components/home/FeaturedTutors";
import { HowItWorks } from "@/components/home/HowItWorks";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { LanguagesSection } from "@/components/home/LanguagesSection";
import { Testimonials } from "@/components/home/Testimonials";
import { CTASection } from "@/components/home/CTASection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturedTutors />
        <HowItWorks />
        <FeaturesSection />
        <LanguagesSection />
        <Testimonials />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
