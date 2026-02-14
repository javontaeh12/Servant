import HeroSection from "@/components/home/HeroSection";
import ServicesPreview from "@/components/home/ServicesPreview";
import CateringAddOns from "@/components/home/CateringAddOns";
import ServiceArea from "@/components/home/ServiceArea";
import PopularMenus from "@/components/home/PopularMenus";
import TestimonialSection from "@/components/home/TestimonialSection";
import CTABanner from "@/components/home/CTABanner";

export default function Home() {
  return (
    <>
      <HeroSection />
      <ServicesPreview />
      <CateringAddOns />
      <PopularMenus />
      <ServiceArea />
      <TestimonialSection />
      <CTABanner />
    </>
  );
}
