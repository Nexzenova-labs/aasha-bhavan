import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Aasha Bhavan — Home of Hope | Orphanage & Elderly Care, Hyderabad',
  description:
    'Aasha Bhavan is a registered orphanage and elderly care home in Hyderabad, Telangana. Home to 115 residents — 68 children and 47 elders. Donate, volunteer, or sponsor a resident today. 80G tax benefit available.',
  keywords:
    'orphanage hyderabad, old age home hyderabad, donate orphanage, sponsor child, elderly care home telangana, aasha bhavan, ngo hyderabad',
  authors: [{ name: 'Aasha Bhavan' }],
  openGraph: {
    title: 'Aasha Bhavan — Home of Hope',
    description:
      'Caring for 68 orphaned children and 47 elderly residents since 2008. Join our family.',
    images: ['/og-image.jpg'],
    type: 'website',
    locale: 'en_IN',
    siteName: 'Aasha Bhavan',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aasha Bhavan — Home of Hope',
    description: 'Caring for 68 orphaned children and 47 elderly residents since 2008.',
  },
  robots: { index: true, follow: true },
  alternates: { canonical: 'https://aashabhavan.org' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;1,500&family=DM+Sans:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css"
        />
        <script src="https://checkout.razorpay.com/v1/checkout.js" async />
      </head>
      <body>{children}</body>
    </html>
  );
}
