import { Toaster } from 'react-hot-toast';
import { Providers } from './providers';
import './globals.css';

export const metadata = {
  title: 'AI-Assisted Proposal Platform',
  description: 'Create and manage proposals with AI assistance',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}
