import type { Metadata } from "next";
import ServicesContent from "./ServicesContent";

export const metadata: Metadata = {
  title: "Our Specialties",
  description:
    "Explore our catering specialties — weddings, corporate events, private parties, and more. Premium southern cuisine tailored to your occasion.",
};

export default function ServicesPage() {
  return <ServicesContent />;
}
