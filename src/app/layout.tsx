import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { SocketProvider } from '@/contexts/SocketContext';
import { SWRProvider } from '@/components/SWRProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TaskFlow - Task Management',
  description: 'Collaborative task management application',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SWRProvider>
          <SocketProvider>
            {children}
          </SocketProvider>
        </SWRProvider>
      </body>
    </html>
  );
}