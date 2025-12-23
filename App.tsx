
import React, { useState, useRef } from 'react';
import ResultCard from './components/ResultCard';
import { identifyMedications } from './services/geminiService';
import { IdentificationResult, GroundingSource } from './types';

type AppState = 'HOME' | 'PREVIEW' | 'RESULT';

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
        // base64 데이터만 추출 (data:image/jpeg;base64, 부분 제외)
        const base64 = result.split(',')[1];
        handleCapture(base64);
      }
    };
    reader.readAsDataURL(file);
    // 같은 파일을 다시 선택할 수 있도록 초기화
    event.target.value = '';
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

        {/* Home State: Single Integrated Action Button */}
        {appState === 'HOME' && (
          <div className="space-y-10 animate-in fade-in duration-500 py-10">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-extrabold text-slate-900 leading-tight">
                어떤 약인지 궁금하신가요?
              </h2>
              <p className="text-slate-500 text-lg">
                사진 한 장으로 약품 명칭부터 성분까지 <br/>
                지능형 분석 리포트를 받아보세요.
              </p>
            </div>

            <div className="flex justify-center">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="group relative w-full max-w-sm aspect-square bg-white border-2 border-dashed border-slate-200 rounded-[3rem] flex flex-col items-center justify-center gap-6 hover:border-blue-500 hover:bg-blue-50/30 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-blue-100"
              >
                <div className="w-24 h-24 bg-blue-600 rounded-3xl flex items-center justify-center shadow-xl shadow-blue-200 group-hover:scale-110 transition-transform duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="text-center">
                  <span className="block text-2xl font-bold text-slate-800">사진 선택하기</span>
                  <span className="text-slate-400 mt-1 block font-medium">촬영 또는 앨범에서 불러오기</span>
                </div>
                
                {/* Decorative dots */}
                <div className="absolute top-6 right-6 flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-blue-200"></div>
                  <div className="w-2 h-2 rounded-full bg-blue-100"></div>
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

            <div className="bg-white border border-slate-100 rounded-3xl p-6 flex gap-4 shadow-sm">
              <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center shrink-0 border border-amber-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 mb-1">분석 팁</p>
                <p className="text-sm text-slate-500 leading-relaxed">
                  약 상자나 알약의 식별 문자가 잘 보이도록 <br/>
                  밝은 곳에서 선명하게 찍어주시는 것이 좋습니다.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Preview State: Showing image before analysis */}
        {appState === 'PREVIEW' && capturedImage && (
          <div className="space-y-8 animate-in zoom-in-95 duration-300 py-4">
            <div className="relative aspect-[4/5] w-full max-w-sm mx-auto rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white">
              <img 
                src={`data:image/jpeg;base64,${capturedImage}`} 
                alt="Selected" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-white text-sm font-medium bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full inline-block">
                  선택된 사진
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-4 max-w-sm mx-auto">
              <button
                onClick={handleStartAnalysis}
                disabled={isProcessing}
                className={`w-full py-5 rounded-2xl text-white font-bold text-xl shadow-xl flex items-center justify-center gap-3 transition-all ${
                  isProcessing ? 'bg-slate-400' : 'bg-blue-600 hover:bg-blue-700 active:scale-95 shadow-blue-200'
                }`}
              >
                {isProcessing ? (
                  <>
                    <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                    식별 분석 중...
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
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-4 rounded-2xl text-slate-600 font-bold bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  사진 다시 선택
                </button>
              )}
            </div>
          </div>
        )}

        {/* Result State */}
        {appState === 'RESULT' && result && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white p-7 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -mr-12 -mt-12 opacity-50"></div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <h3 className="text-2xl font-bold text-slate-800 tracking-tight">분석 리포트</h3>
              </div>
              <p className="text-slate-600 leading-relaxed relative z-10 text-lg">{result.summary}</p>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">식별된 의약품 ({result.medications.length})</h4>
              {result.medications.map((med, idx) => (
                <ResultCard key={idx} medication={med} />
              ))}
            </div>

            {sources.length > 0 && (
              <div className="bg-slate-100 rounded-[2rem] p-8 mt-10 border border-slate-200">
                <h4 className="text-sm font-bold text-slate-500 mb-5 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  검색 결과 및 참고 문헌
                </h4>
                <div className="grid grid-cols-1 gap-3">
                  {sources.map((source, idx) => (
                    <a 
                      key={idx}
                      href={source.uri} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-white px-5 py-4 rounded-2xl text-sm text-blue-600 hover:text-blue-800 border border-slate-200 truncate flex items-center justify-between group transition-all hover:border-blue-300"
                    >
                      <span className="flex items-center gap-3 font-semibold">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
                        </svg>
                        {source.title}
                      </span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all translate-x-[-4px] group-hover:translate-x-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
      <footer className="bg-white border-t border-slate-200 py-12 px-6 mt-auto">
        <div className="max-w-xl mx-auto text-center space-y-5">
          <p className="text-[11px] text-slate-400 font-black uppercase tracking-[0.2em]">
            MediScan AI Medical Disclaimer
          </p>
          <p className="text-sm text-slate-400 leading-relaxed max-w-sm mx-auto">
            이 분석 결과는 AI에 의해 생성되었으며 오류가 있을 수 있습니다. <br/>
            중요한 건강 결정은 반드시 의사 또는 약사와 상담하십시오.
          </p>
          <div className="pt-4 flex justify-center gap-6 grayscale opacity-50">
             <div className="w-10 h-10 bg-slate-100 rounded-full"></div>
             <div className="w-10 h-10 bg-slate-100 rounded-full"></div>
             <div className="w-10 h-10 bg-slate-100 rounded-full"></div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
