import { useState } from 'react';
import { UploadCloud, Camera, CheckCircle2, AlertTriangle, ArrowRight, Activity, Sprout } from 'lucide-react';

const DiseaseDetection = () => {
  const [image, setImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [step, setStep] = useState(0);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImage(url);
      setResult(null);
    }
  };

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    setStep(1);
    
    setTimeout(() => setStep(2), 1000);
    setTimeout(() => setStep(3), 2000);
    setTimeout(() => setStep(4), 3000);
    
    setTimeout(() => {
      setIsAnalyzing(false);
      setResult({
        condition: 'Leaf Blight',
        risk: 'Moderate',
        confidence: '87%',
        assessment: 'Possible signs of fungal infection detected. Spots and discoloration visible around the leaf surface.',
        actions: [
          'Monitor affected leaves.',
          'Avoid excessive irrigation.',
          'Inspect nearby plants.',
          'Consult a local agricultural expert before treatment.'
        ]
      });
    }, 4000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <div className="max-w-3xl mx-auto mb-10 text-center">
        <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-4">Check a crop</h1>
        <p className="text-[var(--color-text-secondary)] text-lg">Take a clear photo of the affected leaf to receive an AI-assisted diagnostic assessment.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
        
        {/* LEFT COLUMN: UPLOAD */}
        <div className="flex flex-col gap-6">
          <div className="card p-2">
            {!image ? (
              <label className="flex flex-col items-center justify-center h-80 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group">
                <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 group-hover:scale-105 transition-transform text-[var(--color-text-muted)]">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <p className="text-lg font-semibold text-[var(--color-text-primary)] mb-1">Upload crop image</p>
                <p className="text-sm text-[var(--color-text-secondary)] mb-6">JPG, PNG up to 10MB</p>
                <div className="flex items-center gap-3">
                  <span className="btn-secondary px-6 py-2 rounded-full text-sm">Choose Image</span>
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
              </label>
            ) : (
              <div className="relative h-80 rounded-xl overflow-hidden group">
                <img src={image} alt="Crop to analyze" className="w-full h-full object-cover" />
                {!isAnalyzing && !result && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <label className="btn-secondary text-white border border-white/40 cursor-pointer backdrop-blur-md">
                      Change Image
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                    </label>
                  </div>
                )}
                {isAnalyzing && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                    <Activity className="w-10 h-10 animate-pulse text-[var(--color-brand-light)] mb-4" />
                    <p className="font-medium text-lg mb-2">Analyzing crop image...</p>
                    <div className="flex flex-col gap-2 w-64 text-sm text-gray-300">
                      <div className={`flex items-center gap-2 ${step >= 1 ? 'opacity-100' : 'opacity-0'}`}><CheckCircle2 className="w-4 h-4 text-green-400" /> Reading image</div>
                      <div className={`flex items-center gap-2 ${step >= 2 ? 'opacity-100' : 'opacity-0'}`}><CheckCircle2 className="w-4 h-4 text-green-400" /> Examining leaf patterns</div>
                      <div className={`flex items-center gap-2 ${step >= 3 ? 'opacity-100' : 'opacity-0'}`}><CheckCircle2 className="w-4 h-4 text-green-400" /> Generating insights</div>
                    </div>
                  </div>
                )}
                {result && (
                  <div className="absolute inset-0 border-4 border-[var(--color-brand-light)] rounded-xl pointer-events-none"></div>
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-center gap-4">
            {!image && (
              <button className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-gray-200 text-[var(--color-text-secondary)] font-medium hover:bg-gray-50 transition-colors w-full">
                <Camera className="w-5 h-5" />
                Use camera
              </button>
            )}
            {image && !result && !isAnalyzing && (
              <button onClick={handleAnalyze} className="btn-primary w-full py-4 text-lg shadow-lg shadow-green-900/10 flex items-center justify-center gap-2">
                <Sprout className="w-5 h-5" /> Analyze with Gemini AI
              </button>
            )}
            {result && (
              <button onClick={() => { setImage(null); setResult(null); }} className="btn-secondary w-full py-3">
                Analyze another image
              </button>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: RESULT */}
        <div>
          {!result && !isAnalyzing && (
             <div className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-gray-100 rounded-3xl bg-gray-50/50">
               <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4 text-gray-400">
                 <Activity className="w-8 h-8" />
               </div>
               <h3 className="text-lg font-medium text-[var(--color-text-primary)] mb-2">Diagnostic Report</h3>
               <p className="text-[var(--color-text-secondary)] max-w-xs">Upload an image to receive a detailed AI assessment of the crop's condition.</p>
             </div>
          )}

          {isAnalyzing && (
            <div className="h-full flex flex-col items-center justify-center p-8 rounded-3xl bg-gray-50 animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-6"></div>
              <div className="h-24 bg-gray-200 rounded w-full mb-6"></div>
              <div className="w-full space-y-3">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
              </div>
            </div>
          )}

          {result && (
            <div className="card h-full p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-start justify-between mb-6 pb-6 border-b border-gray-100">
                <div>
                  <p className="text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1">Possible Issue</p>
                  <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">{result.condition}</h2>
                </div>
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-700 rounded-lg font-semibold text-sm mb-2">
                    <AlertTriangle className="w-4 h-4" /> {result.risk} Risk
                  </div>
                  <p className="text-xs text-[var(--color-text-muted)]">{result.confidence} Confidence</p>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="font-semibold text-[var(--color-text-primary)] mb-2">Observed Signs</h3>
                <p className="text-[var(--color-text-secondary)] leading-relaxed">{result.assessment}</p>
              </div>

              <div>
                <h3 className="font-semibold text-[var(--color-text-primary)] mb-4">What to check next</h3>
                <ul className="space-y-3">
                  {result.actions.map((action, index) => (
                    <li key={index} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                      <div className="mt-0.5 min-w-[20px] h-5 rounded-full bg-[var(--color-bg-main)] flex items-center justify-center text-xs font-bold text-[var(--color-text-secondary)]">
                        {index + 1}
                      </div>
                      <span className="text-[var(--color-text-primary)] text-sm">{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-100">
                <p className="text-xs text-blue-800 leading-relaxed text-center">
                  AI results are informational and should not replace professional agricultural advice.
                </p>
              </div>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
};

export default DiseaseDetection;
