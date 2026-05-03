'use client';

import { usePathname } from 'next/navigation';

const NAV_LINKS = [
  { href: '/corpus', label: 'Corpus' },
  { href: '/upload', label: 'Subir captura' },
  { href: '/codificacion', label: 'Codificación' },
  { href: '/grafo', label: 'Grafo' },
];

function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Navegación principal">
      <ul className="space-y-1" role="list">
        {NAV_LINKS.map(({ href, label }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/');
          return (
            <li key={href}>
              <a
                href={href}
                aria-current={isActive ? 'page' : undefined}
                className={`
                  block px-4 py-2 rounded text-sm font-medium transition-colors
                  focus-visible:outline-2 focus-visible:outline-offset-2
                  ${isActive
                    ? 'bg-accent-100 text-accent-900 dark:bg-accent-900/20 dark:text-accent-200'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-900'
                  }
                `}
              >
                {label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <div className="flex min-h-screen bg-white dark:bg-gray-950">
      <aside
        className="w-64 shrink-0 border-r border-gray-200 dark:border-gray-800 p-4 flex flex-col"
        aria-label="Barra lateral"
      >
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 mb-3">
          Contra-archivo
        </p>
        <AdminNav />
      </aside>
      <main id="main-content" className="flex-1 p-8 min-w-0" tabIndex={-1}>
        {children}
      </main>
    </div>
  );
}
