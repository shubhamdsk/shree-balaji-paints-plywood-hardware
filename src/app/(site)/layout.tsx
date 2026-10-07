import Footer from "@/components/layout/Footer";
import MobileNav from "@/components/layout/MobileNav";
import Navbar from "@/components/layout/Navbar";
import WhatsAppButton from "@/components/layout/WhatsAppButton";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppButton />
      <MobileNav />
    </>
  );
}
