import HeroSection from "@/components/home/HeroSection";
import ServicesPreview from "@/components/home/ServicesPreview";
import ServiceArea from "@/components/home/ServiceArea";
import PopularMenus from "@/components/home/PopularMenus";
import TestimonialSection from "@/components/home/TestimonialSection";
import CTABanner from "@/components/home/CTABanner";

export default function Home() {
  return (
    <>
      <HeroSection />
      <ServicesPreview />
      <ServiceArea />
      <PopularMenus />
      <TestimonialSection />
      <CTABanner />
    </>
  );
}
