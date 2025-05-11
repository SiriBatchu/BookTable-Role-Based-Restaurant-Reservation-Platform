import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar";
import { AuthProvider } from "../context/AuthContext";
import {RestaurantProvider} from "../context/RestaurantContext";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "TableTales - Restaurant Booking",
  description: "Discover and book your perfect dining experience",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} antialiased`}>
        <AuthProvider>
          <RestaurantProvider>
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-grow w-full">{children}</main>
              <Toaster position="bottom-center" />
            </div>
          </RestaurantProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
