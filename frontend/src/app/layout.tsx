import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { SafetyBanner } from '../components/SafetyBanner';
import { UserProvider } from '../lib/user-store';
import { AuthModal } from '../components/AuthModal';

export const metadata: Metadata = {
  title: 'Takshvaya (तक्ष्वया) | The Verified Fresher Career Portal (0-2 Yrs)',
  description: 'Fast, free, and ad-free career platform for freshers. Featuring skill-matching, gap analysis roadmaps, verified corporate recruiters, and automated fraud defense.',
  keywords: ['fresher jobs', '0-2 years experience jobs', 'graduate engineering jobs', 'verified recruiters', 'skill gap analysis', 'zero ads job portal'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-[#FDFBF7] text-slate-900 antialiased selection:bg-teal-700 selection:text-white">
        <UserProvider>
          <SafetyBanner />
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <AuthModal />
        </UserProvider>
      </body>
    </html>
  );
}
