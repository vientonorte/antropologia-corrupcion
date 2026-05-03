import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Contra-archivo Terraza',
  description: 'Admin privada para análisis etnográfico de corrupción institucional',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
