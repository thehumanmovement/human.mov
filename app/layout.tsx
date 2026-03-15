import type { Metadata } from 'next'
import { Cormorant_Garamond, Libre_Franklin } from 'next/font/google'
import './globals.css'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-cormorant',
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
})

const libre = Libre_Franklin({
  subsets: ['latin'],
  variable: '--font-libre',
  weight: ['300', '400', '500', '600'],
})

export const metadata: Metadata = {
  title: 'The Human Movement',
  description: 'If You\'re Human, You\'re Likely Already Part of It.',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'The Human Movement',
    description: 'If You\'re Human, You\'re Likely Already Part of It.',
    url: 'https://www.human.mov',
    siteName: 'The Human Movement',
    images: [
      {
        url: 'https://www.human.mov/og-image.jpg',
        width: 1200,
        height: 630,
        type: 'image/jpeg',
        alt: 'The Human Movement',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Human Movement',
    description: 'If You\'re Human, You\'re Likely Already Part of It.',
    images: ['https://www.human.mov/og-image.jpg'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${cormorant.variable} ${libre.variable} font-body`}>
        {children}
      </body>
    </html>
  )
}
