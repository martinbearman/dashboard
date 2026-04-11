import LandingPage from "@/components/landing/LandingPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Universal Dashboard",
  description: "Modular workspace with local storage or sign-in when available.",
};

export default function Home() {
  return <LandingPage />;
}
