import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import localFont from 'next/font/local'
import './globals.css'

const redaction = localFont({
  src: [
    { path: '../public/fonts/Redaction-Regular.woff', weight: '400', style: 'normal' },
    { path: '../public/fonts/Redaction-Italic.woff', weight: '400', style: 'italic' },
    { path: '../public/fonts/Redaction-Bold.woff', weight: '700', style: 'normal' },
  ],
  variable: '--font-redaction',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
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
      <body className={`${redaction.variable} ${inter.variable} font-body`}>
        {children}
      </body>
    </html>
  )
}
