'use client';

import { useState } from 'react';
import { UploadForm } from '@/components/molecules/UploadForm';

export default function UploadPage(): React.ReactElement {
  const [lastUploadId, setLastUploadId] = useState<string | null>(null);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Subir Captura</h1>
        <p className="text-gray-600">
          Carga documentos, imágenes o PDFs para análisis del contra-archivo
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <UploadForm
          onSuccess={(uploadId) => {
            setLastUploadId(uploadId);
          }}
        />
      </div>

      {lastUploadId && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            ✓ Archivo subido exitosamente. ID: <code className="font-mono">{lastUploadId}</code>
          </p>
        </div>
      )}
    </div>
  );
}
