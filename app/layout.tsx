import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/ui/themes";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ghost AI",
  description: "Real-time collaborative system design workspace",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        theme: dark,
        variables: {
          colorBackground: "#111114",
          colorInput: "#18181c",
          colorInputForeground: "#f0f0f4",
          colorForeground: "#f0f0f4",
          colorMutedForeground: "#c0c0cc",
          colorMuted: "#18181c",
          colorPrimary: "#00c8d4",
          colorDanger: "#ff4d4f",
          colorBorder: "#2a2a30",
          colorNeutral: "#f0f0f4",
          borderRadius: "0.75rem",
          fontFamily: "Geist, sans-serif",
        },
        elements: {
          card: {
            backgroundColor: "#111114",
            border: "1px solid #2a2a30",
            boxShadow: "none",
          },
          socialButtonsBlockButton: {
            backgroundColor: "#18181c",
            border: "1px solid #2a2a30",
            color: "#f0f0f4",
          },
          socialButtonsBlockButtonText: {
            color: "#f0f0f4",
          },
          formFieldInput: {
            backgroundColor: "#18181c",
            border: "1px solid #2a2a30",
            color: "#f0f0f4",
          },
          formButtonPrimary: {
            backgroundColor: "#00c8d4",
            color: "#080809",
          },
          footerActionLink: {
            color: "#00c8d4",
          },
          identityPreviewEditButton: {
            color: "#00c8d4",
          },
          headerTitle: {
            color: "#f0f0f4",
          },
          headerSubtitle: {
            color: "#c0c0cc",
          },
          dividerLine: {
            backgroundColor: "#2a2a30",
          },
          dividerText: {
            color: "#808090",
          },
        },
      }}
    >
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col font-sans">{children}</body>
      </html>
    </ClerkProvider>
  );
}
