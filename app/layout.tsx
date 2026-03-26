import type { Metadata } from 'next'
import { Inter, Oswald } from 'next/font/google'
import './globals.css'

const oswald = Oswald({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['500', '600', '700'],
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['300', '400', '500', '600'],
})

export const metadata: Metadata = {
  title: 'The Human Movement',
  description: "What's the human movement?",
  icons: {
    icon: '/favicon.ico?v=2',
    apple: '/apple-touch-icon.png?v=2',
  },
  openGraph: {
    title: 'The Human Movement',
    description: "What's the human movement?",
    url: 'https://www.human.mov',
    siteName: 'The Human Movement',
    images: [
      {
        url: 'https://www.human.mov/api/og',
        width: 1200,
        height: 630,
        type: 'image/png',
        alt: 'The Human Movement',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Human Movement',
    description: "What's the human movement?",
    images: ['https://www.human.mov/api/og'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${oswald.variable} ${inter.variable} font-body`}>
        {children}
      </body>
    </html>
  )
}
