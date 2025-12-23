
import React, { useState, useRef } from 'react';
import CameraView from './components/CameraView';
import ResultCard from './components/ResultCard';
import { identifyMedications } from './services/geminiService';
import { IdentificationResult, GroundingSource } from './types';

type AppState = 'HOME' | 'CAMERA' | 'PREVIEW' | 'RESULT';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('HOME');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [result, setResult] = useState<IdentificationResult | null>(null);
  const [sources, setSources] = useState<GroundingSource[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCapture = (base64Image: string) => {
    setCapturedImage(base64Image);
    setAppState('PREVIEW');
  };

  const handleStartAnalysis = async () => {
    if (!capturedImage) return;
    setIsProcessing(true);
    setError(null);
    try {
      const { data, sources: groundingSources } = await identifyMedications(capturedImage);
      setResult(data);
      setSources(groundingSources);
      setAppState('RESULT');
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
    reader.readAsDataURL(file);
  };

  const handleReset = () => {
    setResult(null);
    setSources([]);
    setCapturedImage(null);
    setError(null);
    setAppState('HOME');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-xl mx-auto px-4 py-4 flex items-center justify-between">
          {/* Fix: Merged duplicate className attributes into one */}
          <div onClick={handleReset} className="cursor-pointer flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-blue-200 shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">MediScan AI</h1>
          </div>
          {appState !== 'HOME' && (
            <button 
              onClick={handleReset}
              className="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
            >
              처음으로
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-xl mx-auto w-full px-4 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        {/* Home State: Choice between Camera or Upload */}
        {appState === 'HOME' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="text-center space-y-3">
              <h2 className="text-3xl font-extrabold text-slate-900">어떤 약인지 궁금하신가요?</h2>
              <p className="text-slate-500 text-lg">사진 한 장으로 약품 정보를 한 번에 확인하세요.</p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <button
                onClick={() => setAppState('CAMERA')}
                className="group p-8 bg-white border-2 border-slate-100 rounded-3xl flex flex-col items-center gap-4 hover:border-blue-500 hover:shadow-xl hover:shadow-blue-100 transition-all duration-300"
              >
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="text-center">
                  <span className="block text-xl font-bold text-slate-800">사진 촬영</span>
                  <span className="text-sm text-slate-400">카메라로 직접 찍기</span>
                </div>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="group p-8 bg-white border-2 border-slate-100 rounded-3xl flex flex-col items-center gap-4 hover:border-blue-500 hover:shadow-xl hover:shadow-blue-100 transition-all duration-300"
              >
                <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center group-hover:bg-emerald-600 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-emerald-600 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="text-center">
                  <span className="block text-xl font-bold text-slate-800">앨범 선택</span>
                  <span className="text-sm text-slate-400">저장된 사진 불러오기</span>
                </div>
              </button>
            </div>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              accept="image/*" 
              className="hidden" 
            />

            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex gap-4">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shrink-0 border border-blue-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm text-blue-800 leading-relaxed font-medium">
                여러 알약이 함께 찍힌 사진도 분석 가능합니다. <br/>
                상표명이나 식별 문자가 잘 보이도록 찍어주세요.
              </p>
            </div>
          </div>
        )}

        {/* Camera State */}
        {appState === 'CAMERA' && (
          <div className="animate-in slide-in-from-bottom-8 duration-500">
             <div className="flex justify-between items-center mb-4 px-2">
                <h2 className="text-xl font-bold">사진 촬영</h2>
                <button onClick={() => setAppState('HOME')} className="text-slate-400 font-medium">취소</button>
             </div>
             <CameraView onCapture={handleCapture} isProcessing={false} />
          </div>
        )}

        {/* Preview State: Showing image before analysis */}
        {appState === 'PREVIEW' && capturedImage && (
          <div className="space-y-6 animate-in zoom-in-95 duration-300">
            <div className="relative aspect-[3/4] w-full max-w-sm mx-auto rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
              <img 
                src={`data:image/jpeg;base64,${capturedImage}`} 
                alt="Captured" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleStartAnalysis}
                disabled={isProcessing}
                className={`w-full py-4 rounded-2xl text-white font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all ${
                  isProcessing ? 'bg-slate-400' : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
                }`}
              >
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    분석 중...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    분석 시작하기
                  </>
                )}
              </button>
              
              {!isProcessing && (
                <button
                  onClick={() => setAppState('HOME')}
                  className="w-full py-4 rounded-2xl text-slate-600 font-bold bg-white border border-slate-200 hover:bg-slate-50"
                >
                  다른 사진 선택
                </button>
              )}
            </div>
          </div>
        )}

        {/* Result State */}
        {appState === 'RESULT' && result && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-8 -mt-8 opacity-50"></div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <h3 className="text-xl font-bold text-slate-800">분석이 완료되었습니다</h3>
              </div>
              <p className="text-slate-600 leading-relaxed relative z-10">{result.summary}</p>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-2">식별된 약품 목록</h4>
              {result.medications.map((med, idx) => (
                <ResultCard key={idx} medication={med} />
              ))}
            </div>

            {sources.length > 0 && (
              <div className="bg-slate-100 rounded-3xl p-6 mt-8 border border-slate-200">
                <h4 className="text-sm font-bold text-slate-500 mb-4 flex items-center gap-2">
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
                      className="bg-white px-4 py-3 rounded-xl text-xs text-blue-600 hover:text-blue-800 border border-slate-200 truncate flex items-center justify-between group transition-colors"
                    >
                      <span className="flex items-center gap-2 font-medium">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
                        </svg>
                        {source.title}
                      </span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer Disclaimer */}
      <footer className="bg-white border-t border-slate-200 py-10 px-4 mt-auto">
        <div className="max-w-xl mx-auto text-center space-y-4">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            MediScan AI Medical Advice Disclaimer
          </p>
          <p className="text-xs text-slate-400 leading-relaxed max-w-md mx-auto">
            본 서비스는 인공지능 기술을 활용하여 정보를 제공하며, 실제 진단이나 처방을 대체할 수 없습니다. 
            정확한 의학적 판단을 위해 반드시 전문 의료진과 상담하십시오.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
