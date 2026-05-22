import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { AuthProvider } from "@/lib/auth/context";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </AuthProvider>
  );
}
