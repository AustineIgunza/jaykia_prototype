import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { AuthProvider } from "@/lib/auth/context";
import { AnimatedBg } from "@/components/ui/animated-bg";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <AnimatedBg />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </AuthProvider>
  );
}
