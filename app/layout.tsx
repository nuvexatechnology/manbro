import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/components/cart/cart-context";
import { UserAuthProvider } from "@/components/auth/user-auth-context";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { AuthModal } from "@/components/auth/AuthModal";

export const metadata: Metadata = {
  title: "MANBRO | Premium Apparel & Luxury Apparel",
  description: "MANBRO - Modern luxury menswear & apparel crafted with organic European flax, Italian wools, and tailored silhouettes. Direct WhatsApp ordering & India Post tracking.",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/images/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/images/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/images/logo-mark.png", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: ["/favicon.ico"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body suppressHydrationWarning className="bg-[#091D12] text-white min-h-screen flex flex-col font-sans antialiased selection:bg-[#d4af37] selection:text-black">
        <UserAuthProvider>
          <CartProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <CartDrawer />
            <AuthModal />
            <Footer />
          </CartProvider>
        </UserAuthProvider>
      </body>
    </html>
  );
}
