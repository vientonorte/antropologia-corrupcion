'use client';

import { useRef, useState } from 'react';
import { Button } from '@/components/atoms/Button';
import { Spinner } from '@/components/atoms/Spinner';

interface UploadFull {
  id: string;
  fileName: string;
  casoId: 1 | 2 | 3 | 4;
  fuenteTipo: string;
  regimenVerdad: string;
  estadoCodificacion: string;
  transcription: string | null;
  analysis: string | null;
  codes: string | null;
  mistranslations: string | null;
  tags: string | null;
  fechaEvento: string | null;
}

interface AnalysisPanelProps {
  upload: UploadFull;
  onSaved?: () => void;
}

type ActiveTab = 'transcription' | 'analysis' | 'codes' | 'mistranslations';

const TABS: { id: ActiveTab; label: string }[] = [
  { id: 'transcription', label: 'Transcripción' },
  { id: 'analysis', label: 'Análisis semántico' },
  { id: 'codes', label: 'Códigos GT' },
  { id: 'mistranslations', label: 'Mistranslations' },
];

const ESTADO_OPTIONS = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'open', label: 'Open' },
  { value: 'axial', label: 'Axial' },
  { value: 'selective', label: 'Selective' },
  { value: 'verificado', label: 'Verificado' },
] as const;

function tryPrettyJson(raw: string | null): string {
  if (!raw) return '';
  try {
    return JSON.stringify(JSON.parse(raw), null, 2);
  } catch {
    return raw;
  }
}

export function AnalysisPanel({ upload, onSaved }: AnalysisPanelProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('transcription');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  const [transcription, setTranscription] = useState(upload.transcription ?? '');
  const [analysis, setAnalysis] = useState(tryPrettyJson(upload.analysis));
  const [codes, setCodes] = useState(tryPrettyJson(upload.codes));
  const [mistranslations, setMistranslations] = useState(tryPrettyJson(upload.mistranslations));
  const [estadoCodificacion, setEstadoCodificacion] = useState(upload.estadoCodificacion);

  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleTabKeyDown = (e: React.KeyboardEvent, index: number) => {
    let next = index;
    if (e.key === 'ArrowRight') next = (index + 1) % TABS.length;
    else if (e.key === 'ArrowLeft') next = (index - 1 + TABS.length) % TABS.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = TABS.length - 1;
    else return;

    e.preventDefault();
    setActiveTab(TABS[next].id);
    tabRefs.current[next]?.focus();
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const response = await fetch('/api/corpus/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uploadId: upload.id,
          transcription,
          analysis,
          codes,
          mistranslations,
          estadoCodificacion,
        }),
      });
      if (!response.ok) {
        const data = await response.json() as { error?: string };
        throw new Error(data.error ?? 'Save failed');
      }
      setSavedAt(new Date());
      if (onSaved) onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setIsSaving(false);
    }
  };

  const currentValue =
    activeTab === 'transcription' ? transcription :
    activeTab === 'analysis' ? analysis :
    activeTab === 'codes' ? codes :
    mistranslations;

  const handleChange = (value: string) => {
    if (activeTab === 'transcription') setTranscription(value);
    else if (activeTab === 'analysis') setAnalysis(value);
    else if (activeTab === 'codes') setCodes(value);
    else setMistranslations(value);
  };

  const isJson = activeTab !== 'transcription';
  const activeTabIndex = TABS.findIndex((t) => t.id === activeTab);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 gap-3">
        <h2 className="text-lg font-semibold text-gray-900 truncate min-w-0">{upload.fileName}</h2>
        <div className="flex items-center gap-3 shrink-0">
          <label htmlFor="estado-select" className="sr-only">Estado de codificación</label>
          <select
            id="estado-select"
            value={estadoCodificacion}
            onChange={(e) => setEstadoCodificacion(e.target.value)}
            className="text-sm px-2 py-1.5 border border-gray-300 rounded focus:outline-2 focus:outline-offset-2 focus:outline-blue-600"
          >
            {ESTADO_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <Button
            type="button"
            variant="primary"
            disabled={isSaving}
            onClick={() => void handleSave()}
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <Spinner size="sm" />
                Guardando…
              </span>
            ) : (
              'Guardar'
            )}
          </Button>
        </div>
      </div>

      {/* WCAG 2.2: roving tabindex pattern for tabs */}
      <div role="tablist" aria-label="Secciones del análisis" className="flex border-b border-gray-200 mb-4 gap-1">
        {TABS.map((tab, i) => (
          <button
            key={tab.id}
            ref={(el) => { tabRefs.current[i] = el; }}
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
            tabIndex={activeTab === tab.id ? 0 : -1}
            onClick={() => setActiveTab(tab.id)}
            onKeyDown={(e) => handleTabKeyDown(e, i)}
            className={`
              px-3 py-2 text-sm font-medium rounded-t border-b-2 transition-colors
              focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600
              ${activeTab === tab.id
                ? 'border-blue-600 text-blue-700 bg-blue-50'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div
        id={`panel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`tab-${activeTab}`}
        tabIndex={0}
        className="flex-1 flex flex-col min-h-0"
      >
        <label htmlFor="editor-textarea" className="sr-only">
          Editar {TABS[activeTabIndex]?.label}
        </label>
        <textarea
          id="editor-textarea"
          value={currentValue}
          onChange={(e) => handleChange(e.target.value)}
          spellCheck={!isJson}
          className={`
            flex-1 w-full p-3 border border-gray-300 rounded-lg resize-none
            text-sm focus:outline-none focus:outline-2 focus:outline-offset-2 focus:outline-blue-600
            ${isJson ? 'font-mono text-xs' : 'font-sans leading-relaxed'}
            ${!currentValue ? 'text-gray-400 italic' : 'text-gray-900'}
          `}
          placeholder={
            isJson
              ? 'Sin datos de análisis todavía. Ejecuta el análisis desde la tarjeta.'
              : 'Sin transcripción todavía.'
          }
        />
      </div>

      {error && (
        <p role="alert" className="mt-2 text-sm text-red-700 bg-red-50 px-3 py-2 rounded border border-red-200">
          {error}
        </p>
      )}

      {savedAt && !error && (
        <p className="mt-2 text-xs text-green-700" aria-live="polite" aria-atomic="true">
          Guardado a las {savedAt.toLocaleTimeString('es-CL')}
        </p>
      )}
    </div>
  );
}
