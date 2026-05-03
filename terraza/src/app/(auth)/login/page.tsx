export default function LoginPage(): React.ReactElement {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-950">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
          Contra-archivo Terraza
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Admin privada para análisis etnográfico de corrupción institucional
        </p>
        <button
          className="px-6 py-2 bg-accent-600 hover:bg-accent-700 text-white rounded font-medium transition-colors"
          aria-label="Entrar con passkey"
        >
          Entrar con passkey
        </button>
      </div>
    </div>
  );
}
