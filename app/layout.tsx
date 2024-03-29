import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

import { ConvexClientProvider } from "@/providers/convex-client-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Miro | The unofficial Fullstack Clone",
  description:
    "Miro is a visual workspace for innovation where teams manage projects, design products, and build the future together. Join 60M+ users from around the world.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  )
}
