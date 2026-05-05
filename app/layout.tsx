// smoke test — preview deploy verification (safe to revert)
import type { Metadata } from 'next'
import { Inter, Oswald } from 'next/font/google'
import Script from 'next/script'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Analytics } from '@vercel/analytics/next'
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
  description: "A global force fighting to protect our jobs, our kids and our freedom in the age of AI.",
  icons: {
    icon: '/favicon.ico?v=2',
    apple: '/apple-touch-icon.png?v=2',
  },
  openGraph: {
    title: 'The Human Movement',
    description: "A global force fighting to protect our jobs, our kids and our freedom in the age of AI.",
    url: 'https://thehumanmovement.org',
    siteName: 'The Human Movement',
    images: [
      {
        url: 'https://thehumanmovement.org/og-image.png',
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
    description: "A global force fighting to protect our jobs, our kids and our freedom in the age of AI.",
    images: ['https://thehumanmovement.org/og-image.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Google Tag Manager — deferred to reduce INP */}
        <Script id="gtm" strategy="lazyOnload">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-PCWTN2N');`}
        </Script>

        {/* Google Ads (gtag.js) — deferred to reduce INP */}
        <Script src="https://www.googletagmanager.com/gtag/js?id=AW-18023035723" strategy="lazyOnload" />
        <Script id="google-ads" strategy="lazyOnload">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'AW-18023035723');`}
        </Script>

        {/* Meta Pixel — deferred to reduce INP */}
        <Script id="meta-pixel" strategy="lazyOnload">
          {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '1386580280155758');
fbq('track', 'PageView');`}
        </Script>
      </head>
      <body className={`${oswald.variable} ${inter.variable} font-body`}>
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-PCWTN2N"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
          {/* Meta Pixel noscript fallback */}
          <img height="1" width="1" style={{ display: 'none' }} src="https://www.facebook.com/tr?id=1386580280155758&ev=PageView&noscript=1" alt="" />
        </noscript>
        {children}
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  )
}
