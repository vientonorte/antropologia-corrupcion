'use client';

import { useRef, useState } from 'react';

interface FileDropzoneProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string[];
  multiple?: boolean;
  disabled?: boolean;
}

export function FileDropzone({
  onFilesSelected,
  accept = ['image/png', 'image/jpeg', 'application/pdf'],
  multiple = false,
  disabled = false,
}: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files).filter((file) =>
      accept.includes(file.type),
    );

    if (files.length > 0) {
      onFilesSelected(multiple ? files : [files[0]]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      onFilesSelected(multiple ? files : [files[0]]);
    }
  };

  const openPicker = () => {
    if (!disabled) inputRef.current?.click();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      inputRef.current?.click();
    }
  };

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label="Zona de carga — arrastra un archivo o presiona Enter para seleccionar"
      aria-disabled={disabled}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={openPicker}
      onKeyDown={handleKeyDown}
      className={`
        relative border-2 border-dashed rounded-lg p-8 text-center
        transition-colors duration-200
        focus-visible:outline-2 focus-visible:outline-offset-2
        ${
          disabled
            ? 'bg-gray-50 border-gray-200 cursor-not-allowed text-gray-400'
            : isDragging
              ? 'bg-blue-50 border-blue-400 cursor-copy'
              : 'bg-white border-gray-300 hover:border-blue-400 cursor-pointer'
        }
      `}
    >
      <input
        ref={inputRef}
        type="file"
        multiple={multiple}
        accept={accept.join(',')}
        onChange={handleInputChange}
        disabled={disabled}
        className="hidden"
        tabIndex={-1}
        aria-hidden="true"
      />

      <div className="flex flex-col items-center gap-2 pointer-events-none">
        <svg
          className="w-12 h-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>

        <div>
          <p className="text-sm font-medium text-gray-700">
            Arrastra archivos aquí o haz clic
          </p>
          <p className="text-xs text-gray-500 mt-1">
            PNG, JPG, PDF (máx. 50MB)
          </p>
        </div>
      </div>
    </div>
  );
}
