import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Vizuara RL Teaching Assistant',
  description: 'AI-powered teaching assistant for the Vizuara Reinforcement Learning Bootcamp',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
