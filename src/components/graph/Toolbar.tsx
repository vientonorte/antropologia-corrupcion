import type { LayerType, FrictionType } from '../../types/casos';

interface Props {
  activeLayer: LayerType;
  activeFrictionType: FrictionType | 'all';
  fieldVisible: boolean;
  onLayerChange: (l: LayerType) => void;
  onFrictionChange: (t: FrictionType | 'all') => void;
  onFieldToggle: (v: boolean) => void;
}

const LAYERS: { id: LayerType; label: string }[] = [
  { id: 'all', label: 'Todas' },
  { id: 'etica', label: '◎ Ética' },
  { id: 'institucional', label: '▣ Institucional' },
  { id: 'material', label: '◈ Material' },
];

const FRICTIONS: { id: FrictionType | 'all'; label: string }[] = [
  { id: 'all', label: 'Todas' },
  { id: 'politica', label: 'Política' },
  { id: 'semantica', label: 'Semántica' },
  { id: 'tecnica', label: 'Técnica' },
];

export function Toolbar({ activeLayer, activeFrictionType, fieldVisible, onLayerChange, onFrictionChange, onFieldToggle }: Props) {
  return (
    <div className="ca-toolbar" role="toolbar" aria-label="Controles del grafo de fricción">
      {/* Filtro de capa */}
      <div className="ca-toolbar__group">
        <span className="ca-toolbar__label" id="ca-layer-label">Capa</span>
        <div className="ca-layer-filter" role="group" aria-labelledby="ca-layer-label">
          {LAYERS.map((l) => (
            <button
              key={l.id}
              type="button"
              className={`ca-layer-btn${activeLayer === l.id ? ' active' : ''}`}
              aria-pressed={activeLayer === l.id}
              onClick={() => onLayerChange(l.id)}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      <div className="ca-toolbar__sep" aria-hidden="true" />

      {/* Filtro de fricción */}
      <div className="ca-toolbar__group">
        <span className="ca-toolbar__label" id="ca-friction-label">Fricción</span>
        <div className="ca-friction-filter" role="group" aria-labelledby="ca-friction-label">
          {FRICTIONS.map((f) => (
            <button
              key={f.id}
              type="button"
              className={`ca-friction-btn${activeFrictionType === f.id ? ' active' : ''}`}
              aria-pressed={activeFrictionType === f.id}
              onClick={() => onFrictionChange(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="ca-toolbar__sep" aria-hidden="true" />

      {/* Leyenda de intensidad */}
      <div className="ca-intensity-legend" aria-label="Leyenda de intensidad de fricción">
        <span className="ca-intensity-legend__label">baja</span>
        <div className="ca-intensity-legend__bar" aria-hidden="true" />
        <span className="ca-intensity-legend__label">crítica</span>
      </div>

      <div className="ca-toolbar__sep" aria-hidden="true" />

      {/* Campo de física */}
      <div className="ca-toolbar__group">
        <span className="ca-toolbar__label" id="ca-field-label">Campo</span>
        <button
          type="button"
          className={`ca-field-btn${fieldVisible ? ' active' : ''}`}
          aria-pressed={fieldVisible}
          onClick={() => onFieldToggle(!fieldVisible)}
        >
          {fieldVisible ? '⊕ Activo' : '⊗ Oculto'}
        </button>
      </div>
    </div>
  );
}
