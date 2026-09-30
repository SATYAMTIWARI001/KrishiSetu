import { useMemo, useState, Suspense, lazy } from 'react';
import {
  ArrowLeft, ArrowRight, Camera, CheckCircle2, Crop, Eye, Map,
  MapPinned, MessageCircle, Move3d, Plus, Rotate3d, UploadCloud,
  X, ZoomIn, ZoomOut, Maximize2, ChevronDown,
} from 'lucide-react';

const Field3DScene = lazy(() => import('../components/Field3DScene'));

/* ─── constants ─── */
const stepLabels = ['Field basics', 'Size and shape', 'Crop history', 'Soil and water', 'Photos and review'];

const initialForm = {
  fieldName: 'North Field', village: 'Niphad', district: 'Nashik', state: 'Maharashtra',
  location: 'Nashik, Maharashtra', fieldSizeUnit: 'acres', fieldSizeValue: 2.4,
  exactDimensions: false, length: '', width: '', dimensionUnit: 'ft', shape: 'rectangle',
  crop: 'Wheat', variety: 'HD 2967', sowingDate: '2026-08-12', expectedHarvest: '2027-01-15',
  irrigation: 'Drip', soil: 'Loamy', previousCrop: 'Onion',
  soilPh: '6.8', organicCarbon: '0.75', nitrogen: '180', phosphorus: '28', potassium: '210',
  moisture: '64',
  notes: 'Maize was grown in the western zone last season. The north edge dries faster after rain.',
};

const convertToAcres = (value, unit) => {
  const map = { acres: 1, hectares: 2.471, bigha: 0.25, guntha: 0.025, sqm: 0.000247 };
  return Number(value) * (map[unit] ?? 1);
};

const calculateDimensionArea = (length, width, unit) => {
  if (!length || !width) return 0;
  const valueInFeet = Number(length) * Number(width);
  const converted = unit === 'ft' ? valueInFeet : unit === 'm' ? (Number(length) * 3.28084) * (Number(width) * 3.28084) : valueInFeet;
  return (converted / 43560).toFixed(2);
};

const displayAreaFromForm = (form) => form.exactDimensions ? calculateDimensionArea(form.length, form.width, form.dimensionUnit) : convertToAcres(form.fieldSizeValue, form.fieldSizeUnit).toFixed(2);

const cropProfiles = {
  Wheat:      { glyph: '🌾', color: 'wheat',      stages: { Seedling: 0.55, Vegetative: 0.82, Flowering: 1, Maturity: 1.12 } },
  Rice:       { glyph: '🌱', color: 'rice',        stages: { Seedling: 0.5,  Vegetative: 0.8,  Flowering: 0.95, Maturity: 1.05 } },
  Cotton:     { glyph: '🌿', color: 'cotton',      stages: { Seedling: 0.5,  Vegetative: 0.85, Flowering: 1, Maturity: 1.12 } },
  Maize:      { glyph: '🌽', color: 'maize',       stages: { Seedling: 0.5,  Vegetative: 0.9,  Flowering: 1, Maturity: 1.15 } },
  Sugarcane:  { glyph: '🎋', color: 'sugarcane',   stages: { Seedling: 0.5,  Vegetative: 0.9,  Flowering: 1, Maturity: 1.1 } },
  Vegetables: { glyph: '🥬', color: 'vegetables',  stages: { Seedling: 0.48, Vegetative: 0.82, Flowering: 0.95, Maturity: 1.05 } },
  Onion:      { glyph: '🌱', color: 'onion',       stages: { Seedling: 0.46, Vegetative: 0.75, Flowering: 0.9, Maturity: 1 } },
};

const monthStages = { June: 'Seedling', July: 'Vegetative', August: 'Vegetative', September: 'Flowering', October: 'Maturity' };

const fieldObservations = [
  { id: 1, x: 30, y: 34, title: 'Crop growth looks good.', detail: 'The central rows are even and the canopy is filling consistently.', zone: 'Zone A', tone: 'healthy' },
  { id: 2, x: 72, y: 63, title: 'Moisture lower in this section.', detail: 'Recorded observation from the north edge after the last rain.', zone: 'Zone B', tone: 'watch' },
  { id: 3, x: 54, y: 78, title: 'Uploaded crop photo.', detail: 'Photo linked to the September flowering check.', zone: 'Zone C', tone: 'good' },
];

const fieldPhotos = [
  { id: 1, date: 'June 12', stage: 'Sowing', image: 'https://images.unsplash.com/photo-1464226184884-fa52ac9fcaae?auto=format&fit=crop&w=600&q=80', marker: { x: 22, y: 28 } },
  { id: 2, date: 'July 18', stage: 'Early growth', image: 'https://images.unsplash.com/photo-1471193945509-9ad0617afabf?auto=format&fit=crop&w=600&q=80', marker: { x: 44, y: 46 } },
  { id: 3, date: 'August 22', stage: 'Vegetative', image: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=600&q=80', marker: { x: 67, y: 40 } },
  { id: 4, date: 'September 28', stage: 'Flowering', image: 'https://images.unsplash.com/photo-1499529112087-3cb3b73?auto=format&fit=crop&w=600&q=80', marker: { x: 76, y: 68 } },
];

/* ─── 3D Loading fallback ─── */
const SceneLoader = () => (
  <div className="scene-loader">
    <div className="scene-loader-inner">
      <div className="scene-loader-spinner" />
      <p>Loading your field…</p>
    </div>
  </div>
);

/* ─── FIELD SESSION COMPONENT ─── */
const FieldSession = ({ form, onEdit }) => {
  const [view, setView] = useState('3d');
  const [month, setMonth] = useState('September');
  const [healthOverlay, setHealthOverlay] = useState(true);
  const [selectedObservation, setSelectedObservation] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [reportReady, setReportReady] = useState(false);
  const [photos, setPhotos] = useState(fieldPhotos);

  const activeStage = monthStages[month];
  const profile = cropProfiles[form.crop] || cropProfiles.Wheat;
  const dimensions = form.exactDimensions && form.length && form.width
    ? { length: form.length, width: form.width }
    : null;

  const handlePhotoUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const image = URL.createObjectURL(file);
    setPhotos((current) => [{ id: Date.now(), date: 'Today', stage: activeStage, image, marker: null }, ...current]);
  };

  return (
    <div className="field-session-shell">
      {/* ─── 1. FIELD HEADER ─── */}
      <div className="field-session-header">
        <div>
          <p className="field-kicker">Field 01 · Field Session</p>
          <div className="field-session-title-row">
            <div>
              <h1>{form.fieldName || 'North Field'}</h1>
              <p>{form.location || `${form.village}, ${form.state}`} · {form.exactDimensions ? `${displayAreaFromForm(form)} acres` : `${form.fieldSizeValue} ${form.fieldSizeUnit}`}</p>
            </div>
            <span className="field-status"><i />Good</span>
          </div>
        </div>
        <div className="field-session-actions">
          <button type="button" className="session-action secondary" onClick={onEdit}><Crop size={16} /> Edit Field</button>
          <button type="button" className="session-action secondary" onClick={() => document.getElementById('field-observations')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}><Plus size={16} /> Update Observation</button>
          <button type="button" className="session-action primary" onClick={() => document.getElementById('field-report')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}><Eye size={16} /> View Report</button>
        </div>
      </div>

      {/* ─── Summary strip ─── */}
      <div className="field-session-summary">
        <div><span>Crop</span><strong>{profile.glyph} {form.crop}</strong></div>
        <div><span>Crop health</span><strong>82%</strong></div>
        <div><span>Moisture</span><strong>💧 {form.moisture}%</strong></div>
        <div><span>Crop stage</span><strong>{activeStage}</strong></div>
        <div><span>Irrigation</span><strong>{form.irrigation}</strong></div>
      </div>

      {/* ─── 2. MAIN 3D FIELD VIEW ─── */}
      <div className="field-session-layout">
        <section className="field-viewer-card">
          <div className="field-viewer-toolbar">
            <div>
              <p className="field-kicker">Digital field view</p>
              <h2>{form.fieldName || 'North Field'} <span>· {form.crop}</span></h2>
            </div>
            <div className="viewer-mode-toggle">
              <button type="button" className={view === '2d' ? 'active' : ''} onClick={() => setView('2d')}><Map size={15} /> 2D Map</button>
              <button type="button" className={view === '3d' ? 'active' : ''} onClick={() => setView('3d')}><Move3d size={15} /> 3D Field</button>
            </div>
          </div>

          {/* 3D Canvas area */}
          <div className="field-3d-stage">
            <Suspense fallback={<SceneLoader />}>
              <Field3DScene
                crop={form.crop}
                stage={activeStage}
                irrigation={form.irrigation}
                healthOverlay={healthOverlay}
                view={view}
                observations={fieldObservations}
                onSelectObservation={setSelectedObservation}
                dimensions={dimensions}
                dimUnit={form.dimensionUnit}
                selectedPhotoMarker={selectedPhoto?.marker}
              />
            </Suspense>
            <div className="viewer-hint"><Rotate3d size={15} /> Drag to rotate · scroll to zoom · right‑click to pan</div>
          </div>

          {/* Controls */}
          <div className="field-viewer-controls">
            <div className="control-group">
              <button type="button" title="Top view" onClick={() => setView(view === '2d' ? '3d' : '2d')}><Maximize2 size={16} /> {view === '2d' ? '3D View' : 'Top View'}</button>
              <button type="button" title="Zoom in"><ZoomIn size={16} /> Zoom</button>
              <button type="button" title="Zoom out"><ZoomOut size={16} /></button>
              <button type="button" title="Rotate"><Rotate3d size={16} /> Rotate</button>
            </div>
            <label className="overlay-toggle">
              <input type="checkbox" checked={healthOverlay} onChange={(e) => setHealthOverlay(e.target.checked)} />
              <span />{' '}Field Health
            </label>
          </div>
        </section>

        {/* ─── 8. FIELD INFORMATION PANEL ─── */}
        <aside className="field-info-column">
          <div className="field-info-card">
            <div className="info-card-title">
              <div>
                <p className="field-kicker">{form.fieldName}</p>
                <h3>{form.exactDimensions ? `${displayAreaFromForm(form)} acres` : `${form.fieldSizeValue} ${form.fieldSizeUnit}`}</h3>
              </div>
              <span className="field-status"><i />Good</span>
            </div>
            <div className="field-metric-grid">
              <div><span>🌾 Crop</span><strong>{form.crop}</strong></div>
              <div><span>🌱 Crop stage</span><strong>{activeStage}</strong></div>
              <div><span>💧 Moisture</span><strong>{form.moisture}%</strong></div>
              <div><span>🌱 Crop health</span><strong>82%</strong></div>
              <div><span>🌧 Recent rainfall</span><strong>42 mm</strong></div>
              <div><span>🚜 Irrigation</span><strong>On Track</strong></div>
              <div><span>📅 Next check</span><strong>3 days</strong></div>
              <div><span>📏 Dimensions</span><strong>{dimensions ? `${dimensions.length}×${dimensions.width} ${form.dimensionUnit}` : 'Not added'}</strong></div>
            </div>
          </div>

          <div className="field-note-card">
            <p className="field-kicker">Recorded field note</p>
            <p>{form.notes.trim() || 'No field note added yet.'}</p>
            <span>Not an automatic disease diagnosis</span>
          </div>

          <div className="field-report-card" id="field-report">
            <div>
              <p className="field-kicker">{reportReady ? 'Report prepared' : 'Ready for review'}</p>
              <h3>{reportReady ? 'North Field report is ready' : 'Generate crop health report'}</h3>
              <p>{reportReady ? 'Your recorded observations, crop history, weather context and photos are ready for review.' : 'Field data, crop history, weather context and photos stay connected.'}</p>
            </div>
            <button type="button" className="session-action primary" onClick={() => setReportReady(true)}>
              <ArrowRight size={16} /> {reportReady ? 'Report ready' : 'Generate Report'}
            </button>
          </div>
        </aside>
      </div>

      {/* ─── 9. WHAT IS CHANGING? + 12. MONTHLY FIELD CHANGE ─── */}
      <section className="field-change-section">
        <div className="section-heading align-left">
          <span className="eyebrow dark">What is changing in {form.fieldName}?</span>
          <h2>Watch your field change through the season.</h2>
        </div>
        <div className="month-scroller">
          {Object.keys(monthStages).map((m) => (
            <button key={m} type="button" className={month === m ? 'active' : ''} onClick={() => setMonth(m)}>{m}</button>
          ))}
        </div>
        <div className="change-timeline">
          {Object.entries(monthStages).map(([m, stg], idx) => (
            <div key={m} className={`change-step ${month === m ? 'active' : ''}`}>
              <span>{m}</span>
              <strong>{idx === 0 ? 'Crop planted' : idx === 4 ? 'Expected maturity' : `${stg} stage`}</strong>
              {idx < 4 && <i>↓</i>}
            </div>
          ))}
        </div>
      </section>

      {/* ─── 10. FIELD PHOTOS + 11. OBSERVATIONS ─── */}
      <section className="field-session-bottom-grid">
        <div className="field-photos-card">
          <div className="section-heading align-left">
            <span className="eyebrow dark">Field photos</span>
            <h2>Remember what changed in each part of the field.</h2>
          </div>
          <div className="field-photo-grid">
            {photos.map((p) => (
              <button key={p.id} type="button" className={selectedPhoto?.id === p.id ? 'selected' : ''} onClick={() => setSelectedPhoto(p)}>
                <img src={p.image} alt={`${form.fieldName} ${p.date}`} />
                <span>{p.date}</span>
                <strong>{p.stage}</strong>
              </button>
            ))}
            <label className="photo-upload">
              <UploadCloud size={20} />
              <span>Add photo</span>
              <input type="file" accept="image/*" onChange={handlePhotoUpload} />
            </label>
          </div>
        </div>
        <div className="observation-card" id="field-observations">
          <div className="section-heading align-left">
            <span className="eyebrow dark">Field observations</span>
            <h2>Notes pinned to your field.</h2>
          </div>
          {fieldObservations.map((obs) => (
            <button key={obs.id} type="button" className="observation-list-item" onClick={() => setSelectedObservation(obs)}>
              <span className={`observation-dot ${obs.tone}`}><MessageCircle size={14} /></span>
              <span><strong>Observation {String(obs.id).padStart(2, '0')}</strong><small>{obs.title}</small></span>
              <ArrowRight size={15} />
            </button>
          ))}
        </div>
      </section>

      {/* ─── Modals ─── */}
      {selectedObservation && (
        <div className="field-modal-backdrop" role="presentation" onClick={() => setSelectedObservation(null)}>
          <div className="field-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="modal-close" onClick={() => setSelectedObservation(null)}><X size={18} /></button>
            <span className={`observation-dot ${selectedObservation.tone}`}><MessageCircle size={16} /></span>
            <p className="field-kicker">{selectedObservation.zone} · Recorded field observation</p>
            <h3>{selectedObservation.title}</h3>
            <p>{selectedObservation.detail}</p>
            <button type="button" className="session-action primary" onClick={() => setSelectedObservation(null)}>Close observation</button>
          </div>
        </div>
      )}

      {selectedPhoto && (
        <div className="field-modal-backdrop" role="presentation" onClick={() => setSelectedPhoto(null)}>
          <div className="field-photo-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="modal-close" onClick={() => setSelectedPhoto(null)}><X size={18} /></button>
            <img src={selectedPhoto.image} alt={selectedPhoto.stage} />
            <div>
              <p className="field-kicker">{form.fieldName} · {selectedPhoto.date}</p>
              <h3>{selectedPhoto.stage}</h3>
              <p>This photo is linked to the highlighted field location when a location is available.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── EVALUATE FIELD PAGE ─── */
const EvaluateField = () => {
  const [form, setForm] = useState(initialForm);
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const stepIndex = step;
  const displayArea = useMemo(() => {
    if (form.exactDimensions) {
      return `${calculateDimensionArea(form.length, form.width, form.dimensionUnit)} acres`;
    }
    return `${convertToAcres(form.fieldSizeValue, form.fieldSizeUnit).toFixed(2)} acres`;
  }, [form]);

  const updateField = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const nextStep = () => setStep((current) => Math.min(current + 1, stepLabels.length - 1));
  const previousStep = () => setStep((current) => Math.max(current - 1, 0));

  const canProceed = () => {
    if (step === 0) return form.fieldName && form.village && form.district && form.state;
    if (step === 1) return form.exactDimensions ? Number(form.length) > 0 && Number(form.width) > 0 : Number(form.fieldSizeValue) > 0;
    if (step === 2) return form.crop && form.previousCrop;
    if (step === 3) return form.irrigation && form.soil;
    return true;
  };

  const completionSummary = {
    fieldName: form.fieldName,
    location: form.location || `${form.village}, ${form.state}`,
    crop: form.crop,
    area: displayArea,
    soil: form.soil,
    irrigation: form.irrigation,
    previousCrop: form.previousCrop,
    health: 'Good',
  };

  const renderStep = () => {
    if (step === 0) {
      return (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-5">
            <label className="block text-sm font-medium text-slate-700">
              Field name
              <input value={form.fieldName} onChange={(event) => updateField('fieldName', event.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500" placeholder="North Field" />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Village
              <input value={form.village} onChange={(event) => updateField('village', event.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500" placeholder="Niphad" />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              District
              <input value={form.district} onChange={(event) => updateField('district', event.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500" placeholder="Nashik" />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              State
              <input value={form.state} onChange={(event) => updateField('state', event.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500" placeholder="Maharashtra" />
            </label>
          </div>
          <div className="rounded-3xl bg-slate-50 p-4 border border-slate-200">
            <p className="text-sm font-semibold text-slate-800 mb-3">Location details</p>
            <div className="flex flex-wrap gap-3">
              <button type="button" className="btn-secondary text-sm">Use current location</button>
              <button type="button" className="btn-secondary text-sm">Select on map</button>
              <button type="button" className="btn-secondary text-sm">Enter manually</button>
            </div>
          </div>
        </div>
      );
    }
    if (step === 1) {
      return (
        <div className="space-y-6">
          <div>
            <p className="text-sm font-medium text-slate-700 mb-3">How large is your field?</p>
            <div className="grid sm:grid-cols-5 gap-3">
              {['acres', 'hectares', 'bigha', 'guntha', 'sqm'].map((unit) => (
                <button key={unit} type="button" onClick={() => updateField('fieldSizeUnit', unit)} className={`rounded-2xl border px-4 py-3 text-sm font-medium transition ${form.fieldSizeUnit === unit ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'}`}>{unit}</button>
              ))}
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            <label className="block text-sm font-medium text-slate-700">Field size value<input value={form.fieldSizeValue} onChange={(event) => updateField('fieldSizeValue', event.target.value)} type="number" step="0.1" className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500" /></label>
            <label className="block text-sm font-medium text-slate-700">Dimension unit<select value={form.dimensionUnit} onChange={(event) => updateField('dimensionUnit', event.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500"><option value="ft">Feet</option><option value="m">Meters</option></select></label>
          </div>
          <div className="rounded-3xl bg-emerald-50/60 p-5 border border-emerald-200">
            <p className="text-sm font-semibold text-slate-800 mb-4">Do you know the exact dimensions?</p>
            <div className="flex flex-wrap gap-3 mb-5">
              {[true, false].map((value) => (
                <button key={String(value)} type="button" onClick={() => updateField('exactDimensions', value)} className={`rounded-full px-4 py-2 text-sm font-medium transition ${form.exactDimensions === value ? 'bg-emerald-700 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>{value ? 'Yes' : 'No'}</button>
              ))}
            </div>
            {form.exactDimensions && (
              <div className="grid md:grid-cols-2 gap-5">
                <label className="block text-sm font-medium text-slate-700">Length<input value={form.length} onChange={(event) => updateField('length', event.target.value)} type="number" step="1" className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500" placeholder="240" /></label>
                <label className="block text-sm font-medium text-slate-700">Width<input value={form.width} onChange={(event) => updateField('width', event.target.value)} type="number" step="1" className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500" placeholder="180" /></label>
              </div>
            )}
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">Estimated field area: <span className="font-semibold text-slate-900">{displayArea}</span></div>
        </div>
      );
    }
    if (step === 2) {
      return (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-5">
            <label className="block text-sm font-medium text-slate-700">Crop<select value={form.crop} onChange={(event) => updateField('crop', event.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500"><option>Wheat</option><option>Rice</option><option>Cotton</option><option>Maize</option><option>Sugarcane</option><option>Vegetables</option><option>Onion</option><option>Soybean</option><option>Orchard</option><option>Empty field</option></select></label>
            <label className="block text-sm font-medium text-slate-700">Variety<input value={form.variety} onChange={(event) => updateField('variety', event.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500" placeholder="HD 2967" /></label>
            <label className="block text-sm font-medium text-slate-700">Sowing date<input type="date" value={form.sowingDate} onChange={(event) => updateField('sowingDate', event.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500" /></label>
            <label className="block text-sm font-medium text-slate-700">Expected harvest<input type="date" value={form.expectedHarvest} onChange={(event) => updateField('expectedHarvest', event.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500" /></label>
          </div>
          <div className="rounded-3xl bg-slate-50 p-5 border border-slate-200">
            <p className="text-sm font-semibold text-slate-800 mb-3">Crop history</p>
            <div className="grid md:grid-cols-2 gap-5">
              <label className="block text-sm font-medium text-slate-700">Previous crop<select value={form.previousCrop} onChange={(event) => updateField('previousCrop', event.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500"><option>Onion</option><option>Soybean</option><option>Wheat</option><option>Maize</option><option>Vegetable</option></select></label>
              <label className="block text-sm font-medium text-slate-700">Crop rotation note<input className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500" value={form.notes} onChange={(event) => updateField('notes', event.target.value)} placeholder="Add a note if needed" /></label>
            </div>
          </div>
        </div>
      );
    }
    if (step === 3) {
      return (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-5">
            <label className="block text-sm font-medium text-slate-700">Soil type<select value={form.soil} onChange={(event) => updateField('soil', event.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500"><option>Loamy</option><option>Sandy</option><option>Clay</option><option>Black soil</option><option>Red soil</option><option>Alluvial</option><option>Unknown</option></select></label>
            <label className="block text-sm font-medium text-slate-700">Irrigation<select value={form.irrigation} onChange={(event) => updateField('irrigation', event.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500"><option>Drip</option><option>Sprinkler</option><option>Flood</option><option>Rain-fed</option><option>Borewell</option><option>Canal</option><option>Other</option></select></label>
            <label className="block text-sm font-medium text-slate-700">pH<input value={form.soilPh} onChange={(event) => updateField('soilPh', event.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500" placeholder="6.8" /></label>
            <label className="block text-sm font-medium text-slate-700">Moisture<input value={form.moisture} onChange={(event) => updateField('moisture', event.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500" placeholder="64" /></label>
            <label className="block text-sm font-medium text-slate-700">Organic carbon<input value={form.organicCarbon} onChange={(event) => updateField('organicCarbon', event.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500" placeholder="0.75" /></label>
            <label className="block text-sm font-medium text-slate-700">N<input value={form.nitrogen} onChange={(event) => updateField('nitrogen', event.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500" placeholder="180" /></label>
            <label className="block text-sm font-medium text-slate-700">P<input value={form.phosphorus} onChange={(event) => updateField('phosphorus', event.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500" placeholder="28" /></label>
            <label className="block text-sm font-medium text-slate-700">K<input value={form.potassium} onChange={(event) => updateField('potassium', event.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500" placeholder="210" /></label>
          </div>
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 flex items-center justify-between gap-4">
            <div><p className="text-sm font-semibold text-slate-800">Soil report upload</p><p className="text-sm text-slate-600">Upload soil report or image for a closer review.</p></div>
            <label className="btn-secondary inline-flex cursor-pointer items-center gap-2 text-sm"><UploadCloud className="h-4 w-4" /> Upload report<input type="file" hidden /></label>
          </div>
        </div>
      );
    }
    return (
      <div className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-sm font-semibold text-slate-800 mb-3">Show us your field</p>
          <div className="grid md:grid-cols-2 gap-5">
            <label className="flex min-h-[150px] cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-white px-4 text-center text-sm text-slate-600 transition hover:border-emerald-400 hover:bg-emerald-50">
              <div className="flex flex-col items-center gap-3"><UploadCloud className="h-8 w-8 text-emerald-700" />Upload field photo<input type="file" hidden /></div>
            </label>
            <label className="flex min-h-[150px] cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-white px-4 text-center text-sm text-slate-600 transition hover:border-emerald-400 hover:bg-emerald-50">
              <div className="flex flex-col items-center gap-3"><Camera className="h-8 w-8 text-emerald-700" />Take a photo<input type="file" accept="image/*" capture="environment" hidden /></div>
            </label>
          </div>
        </div>
        <label className="block text-sm font-medium text-slate-700">
          What would you like us to notice?
          <textarea value={form.notes} onChange={(event) => updateField('notes', event.target.value)} rows="4" className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500" placeholder="For example: the western edge looks drier after the last rain." />
        </label>
      </div>
    );
  };

  if (submitted) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-emerald-700">Your field profile</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">{completionSummary.fieldName}</h1>
          </div>
          <div className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-800">Field condition: Good</div>
        </div>
        <div className="field-session-container">
          <FieldSession form={form} onEdit={() => setSubmitted(false)} />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-emerald-700">Field evaluation</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900 md:text-4xl">Evaluate your field</h1>
          <p className="mt-2 max-w-xl text-base text-slate-600">Tell us about your field and we'll build a visual profile of its current setup.</p>
        </div>
        <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">Draft saved locally</div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr]">
        <aside className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_12px_32px_-28px_rgba(15,23,42,0.6)]">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-100 p-2 text-emerald-700"><MapPinned className="h-5 w-5" /></div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Progress</p>
              <p className="font-semibold text-slate-900">Field setup</p>
            </div>
          </div>
          <div className="space-y-4">
            {stepLabels.map((label, index) => (
              <div key={label} className={`flex items-center gap-3 rounded-2xl border p-3 transition ${index === stepIndex ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-slate-50'}`}>
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${index <= stepIndex ? 'bg-emerald-600 text-white' : 'bg-white text-slate-500 border border-slate-200'}`}>{index + 1}</div>
                <span className={`text-sm font-medium ${index <= stepIndex ? 'text-slate-900' : 'text-slate-500'}`}>{label}</span>
              </div>
            ))}
          </div>
        </aside>

        <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_44px_-28px_rgba(15,23,42,0.6)] sm:p-8">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Step {step + 1}</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">{stepLabels[step]}</h2>
            </div>
            <div className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">
              {step === 0 ? 'Field basics' : step === 1 ? 'Size and shape' : step === 2 ? 'Crop history' : step === 3 ? 'Soil and water' : 'Photos'}
            </div>
          </div>

          {renderStep()}

          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-between">
            <button type="button" onClick={previousStep} disabled={step === 0} className="btn-secondary inline-flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-40"><ArrowLeft className="h-4 w-4" /> Back</button>
            {step < stepLabels.length - 1 ? (
              <button type="button" onClick={nextStep} disabled={!canProceed()} className="btn-primary inline-flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-50">Next <ArrowRight className="h-4 w-4" /></button>
            ) : (
              <button type="button" onClick={() => setSubmitted(true)} disabled={!canProceed()} className="btn-primary inline-flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-50">Save field profile <CheckCircle2 className="h-4 w-4" /></button>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default EvaluateField;
