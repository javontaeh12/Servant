import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileMenu from "@/components/layout/MobileMenu";
import ErrorBoundary from "@/components/ErrorBoundary";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-primary focus:text-white focus:px-4 focus:py-2 focus:rounded-sm focus:text-sm focus:font-bold focus:tracking-wide focus:uppercase"
      >
        Skip to content
      </a>
      <Header />
      <main id="main-content" className="pb-20 md:pb-0">
        <ErrorBoundary>{children}</ErrorBoundary>
      </main>
      <Footer />
      <MobileMenu />
    </>
  );
}
