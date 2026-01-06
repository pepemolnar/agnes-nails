import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "./globals.css";

export const metadata = {
  title: "Agnes Nails - Professional Nail Care & Beautiful Designs",
  description: "Agnes Nails offers professional nail care services, stunning nail designs, and a relaxing spa atmosphere. Book your appointment today!",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="app">
          <Navbar />
          <main className="main-content">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
