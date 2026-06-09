import type { Metadata } from 'next';
import './globals.css';
import { NavBar } from '../components/NavBar';

export const metadata: Metadata = {
  title: 'MedScan AI — AI-Assisted Medical Imaging Analysis',
  description: 'Upload medical images, receive AI-assisted findings, and generate clinical-grade reports for review by healthcare professionals.',
  keywords: 'medical imaging, AI analysis, X-ray, radiology, clinical reports',
  openGraph: {
    title: 'MedScan AI',
    description: 'AI-assisted medical imaging analysis platform',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <NavBar />
        {children}
      </body>
    </html>
  );
}
