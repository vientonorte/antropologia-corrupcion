export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <div className="flex min-h-screen bg-white dark:bg-gray-950">
      <aside className="w-64 border-r border-gray-200 dark:border-gray-800 p-4">
        <nav className="space-y-2">
          <a href="/admin/corpus" className="block px-4 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-900">
            Corpus
          </a>
          <a href="/admin/upload" className="block px-4 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-900">
            Upload
          </a>
          <a href="/admin/codificacion" className="block px-4 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-900">
            Codificación
          </a>
          <a href="/admin/grafo" className="block px-4 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-900">
            Grafo
          </a>
        </nav>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
