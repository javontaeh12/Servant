import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileMenu from "@/components/layout/MobileMenu";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="pb-20 md:pb-0">{children}</main>
      <Footer />
      <MobileMenu />
    </>
  );
}
