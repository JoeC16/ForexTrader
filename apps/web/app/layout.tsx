import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NeuralRender — AI Personalization for Every Website",
  description:
    "Add one script tag. NeuralRender detects each visitor's buying style and dynamically reshapes your site to drive conversions.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased bg-white text-slate-900">{children}</body>
    </html>
  );
}
