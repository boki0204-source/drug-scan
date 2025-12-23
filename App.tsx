
import React, { useState, useRef } from 'react';
import CameraView from './components/CameraView';
import ResultCard from './components/ResultCard';
import { identifyMedications } from './services/geminiService';
import { IdentificationResult, GroundingSource } from './types';

const App: React.FC = () => {
  const [result, setResult] = useState<IdentificationResult | null>(null);
  const [sources, setSources] = useState<GroundingSource[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCapture = async (base64Image: string) => {
    setIsProcessing(true);
    setError(null);
    try {
      const { data, sources: groundingSources } = await identifyMedications(base64Image);
      setResult(data);
      setSources(groundingSources);
      setShowCamera(false);
    } catch (err) {
      console.error("Identification failed:", err);
      setError("약품 식별에 실패했습니다. 사진을 다시 찍거나 다른 사진을 선택해주세요.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        const base64 = result.split(',')[1];
        handleCapture(base64);
      }
    };
    reader.onerror = () => {
      setError("파일을 읽는 중 오류가 발생했습니다.");
    };
    reader.readAsDataURL(file);
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleReset = () => {
    setResult(null);
    setSources([]);
    setError(null);
    setShowCamera(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-blue-200 shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">MediScan AI</h1>
          </div>
          {!showCamera && (
            <button 
              onClick={handleReset}
              className="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
            >
              다시 시도
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-xl mx-auto w-full px-4 py-6">
        {showCamera ? (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-extrabold text-slate-900">약품 분석하기</h2>
              <p className="text-slate-500">사진을 찍거나 갤러리에서 불러와 정보를 확인하세요.</p>
            </div>
            
            <CameraView onCapture={handleCapture} isProcessing={isProcessing} />
            
            <div className="flex flex-col gap-4">
              <button
                onClick={triggerFileUpload}
                disabled={isProcessing}
                className="w-full bg-white border-2 border-slate-200 text-slate-700 font-bold py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-slate-50 active:scale-[0.98] transition-all shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {isProcessing ? "처리 중..." : "갤러리에서 사진 업로드"}
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                accept="image/*" 
                className="hidden" 
              />

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-blue-800 leading-snug">
                  여러 알약이 함께 찍힌 사진도 분석 가능합니다. 성분이 잘 보이도록 고화질 사진을 권장합니다.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            {result && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <h3 className="text-lg font-bold text-slate-800">분석 완료</h3>
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed">{result.summary}</p>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-1">식별된 약품 목록</h4>
                  {result.medications.map((med, idx) => (
                    <ResultCard key={idx} medication={med} />
                  ))}
                </div>

                {sources.length > 0 && (
                  <div className="bg-slate-100 rounded-2xl p-5 mt-8 border border-slate-200">
                    <h4 className="text-sm font-bold text-slate-500 mb-3 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      정보 출처 및 근거
                    </h4>
                    <div className="grid grid-cols-1 gap-2">
                      {sources.map((source, idx) => (
                        <a 
                          key={idx}
                          href={source.uri} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="bg-white px-3 py-2 rounded-lg text-xs text-blue-600 hover:text-blue-800 border border-slate-200 truncate flex items-center gap-2 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m14.828 14.828a4 4 0 015.656 0l4 4a4 4 0 01-5.656 5.656l-1.102-1.101" />
                          </svg>
                          {source.title}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer Disclaimer */}
      <footer className="bg-slate-50 border-t border-slate-200 py-8 px-4 mt-auto">
        <div className="max-w-xl mx-auto text-center space-y-3">
          <div className="flex justify-center gap-4">
             <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center opacity-50">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
               </svg>
             </div>
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            MediScan AI Medical Advice Disclaimer
          </p>
          <p className="text-[11px] text-slate-400 leading-relaxed max-w-sm mx-auto">
            본 서비스는 인공지능 기술을 활용하여 정보를 제공하며, 진단이나 처방을 대체할 수 없습니다. 
            정확한 의학적 판단을 위해 반드시 의료진과 상담하십시오.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
