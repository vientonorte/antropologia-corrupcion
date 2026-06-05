'use client';

import { useState } from 'react';
import { FileDropzone } from './FileDropzone';
import { CASOS } from '@/lib/corpus/cases';
import { Button } from '@/components/atoms/Button';
import { Spinner } from '@/components/atoms/Spinner';

interface UploadFormProps {
  onSuccess?: (uploadId: string) => void;
}

const FUENTES = [
  { value: 'documento_oficial', label: 'Documento oficial' },
  { value: 'prensa', label: 'Prensa' },
  { value: 'testimonio', label: 'Testimonio' },
  { value: 'red_social', label: 'Red social' },
  { value: 'archivo_propio', label: 'Archivo propio' },
  { value: 'otro', label: 'Otro' },
] as const;

const REGIMEN_VERDAD = [
  { value: 'juridico', label: 'Jurídico' },
  { value: 'mediatico', label: 'Mediático' },
  { value: 'institucional', label: 'Institucional' },
  { value: 'testimonial', label: 'Testimonial' },
] as const;

export function UploadForm({ onSuccess }: UploadFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [casoId, setCasoId] = useState<string>('1');
  const [fuenteTipo, setFuenteTipo] = useState<string>('documento_oficial');
  const [regimenVerdad, setRegimenVerdad] = useState<string>('juridico');
  const [tags, setTags] = useState<string>('');
  const [fechaEvento, setFechaEvento] = useState<string>('');

  const handleFilesSelected = (files: File[]) => {
    if (files.length > 0) {
      setSelectedFile(files[0]);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      setError('Debes seleccionar un archivo');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append(
        'metadata',
        JSON.stringify({
          casoId,
          fuenteTipo,
          regimenVerdad,
          tags: tags ? tags.split(',').map((t) => t.trim()) : [],
          fechaEvento: fechaEvento || undefined,
        }),
      );

      const response = await fetch('/api/corpus/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to upload file');
      }

      const data = await response.json();
      setSelectedFile(null);
      setCasoId('1');
      setFuenteTipo('documento_oficial');
      setRegimenVerdad('juridico');
      setTags('');
      setFechaEvento('');

      if (onSuccess) {
        onSuccess(data.uploadId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="caso" className="block text-sm font-medium text-gray-900 mb-2">
          Caso etnográfico
        </label>
        <select
          id="caso"
          value={casoId}
          onChange={(e) => setCasoId(e.target.value)}
          disabled={isUploading}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-900 focus:outline-none focus:outline-2 focus:outline-offset-2 focus:outline-blue-600"
        >
          {Object.entries(CASOS).map(([_key, caso]) => (
            <option key={caso.id} value={caso.id}>
              {caso.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="fuente" className="block text-sm font-medium text-gray-900 mb-2">
          Tipo de fuente
        </label>
        <select
          id="fuente"
          value={fuenteTipo}
          onChange={(e) => setFuenteTipo(e.target.value)}
          disabled={isUploading}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-900 focus:outline-none focus:outline-2 focus:outline-offset-2 focus:outline-blue-600"
        >
          {FUENTES.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="regimen" className="block text-sm font-medium text-gray-900 mb-2">
          Régimen de verdad
        </label>
        <select
          id="regimen"
          value={regimenVerdad}
          onChange={(e) => setRegimenVerdad(e.target.value)}
          disabled={isUploading}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-900 focus:outline-none focus:outline-2 focus:outline-offset-2 focus:outline-blue-600"
        >
          {REGIMEN_VERDAD.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="tags" className="block text-sm font-medium text-gray-900 mb-2">
          Tags (separados por comas)
        </label>
        <input
          id="tags"
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          disabled={isUploading}
          placeholder="e.g., gobernanza, datos, corrupción"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:outline-2 focus:outline-offset-2 focus:outline-blue-600"
        />
      </div>

      <div>
        <label htmlFor="fecha" className="block text-sm font-medium text-gray-900 mb-2">
          Fecha del evento (opcional)
        </label>
        <input
          id="fecha"
          type="date"
          value={fechaEvento}
          onChange={(e) => setFechaEvento(e.target.value)}
          disabled={isUploading}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:outline-2 focus:outline-offset-2 focus:outline-blue-600"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Archivo
        </label>
        <FileDropzone onFilesSelected={handleFilesSelected} disabled={isUploading} />
        {selectedFile && (
          <p className="mt-2 text-sm text-gray-600">
            Archivo seleccionado: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)}MB)
          </p>
        )}
      </div>

      {error && (
        <div role="alert" className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
          {error}
        </div>
      )}

      <Button
        type="submit"
        variant="primary"
        disabled={!selectedFile || isUploading}
        className="w-full"
      >
        {isUploading ? (
          <span className="flex items-center justify-center gap-2">
            <Spinner size="sm" />
            Subiendo...
          </span>
        ) : (
          'Subir captura'
        )}
      </Button>
    </form>
  );
}
