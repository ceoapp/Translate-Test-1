import React, { useState, useEffect, useRef } from 'react';
import { translateText } from './services/geminiService';
import { SparklesIcon, ArrowRightIcon, CopyIcon, CheckIcon, XIcon, TrashIcon } from './components/Icons';
import Button from './components/Button';
import { TranslationRecord } from './types';

function App() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [history, setHistory] = useState<TranslationRecord[]>(() => {
    try {
      const saved = localStorage.getItem('translationHistory');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [inputText]);

  useEffect(() => {
    localStorage.setItem('translationHistory', JSON.stringify(history));
  }, [history]);

  const handleTranslate = async () => {
    if (!inputText.trim()) return;

    setIsLoading(true);
    try {
      const translated = await translateText(inputText);
      setOutputText(translated);

      // Add to history
      const newRecord: TranslationRecord = {
        id: Date.now().toString(),
        original: inputText,
        translated: translated,
        timestamp: Date.now(),
      };
      setHistory(prev => [newRecord, ...prev].slice(0, 10)); // Keep last 10
    } catch (error) {
      console.error(error);
      alert('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!outputText) return;
    navigator.clipboard.writeText(outputText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleClear = () => {
    setInputText('');
    setOutputText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const loadHistoryItem = (item: TranslationRecord) => {
    setInputText(item.original);
    setOutputText(item.translated);
  };

  const clearHistory = () => {
    setHistory([]);
  };

  // Keyboard shortcut for translation (Cmd/Ctrl + Enter)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      handleTranslate();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-primary-100 selection:text-primary-900 pb-20">
      
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary-50 rounded-lg text-primary-600">
              <SparklesIcon size={20} />
            </div>
            <h1 className="text-xl font-semibold tracking-tight text-gray-900">
              Thai<span className="text-primary-600">Minima</span>
            </h1>
          </div>
          <div className="text-xs font-medium text-gray-400 px-3 py-1 bg-gray-50 rounded-full border border-gray-100">
            Powered by Gemini
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        
        {/* Main Translator Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-100 border border-gray-100 overflow-hidden">
          
          {/* Language Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50 bg-white">
            <div className="flex items-center gap-4 w-full">
              <span className="font-semibold text-gray-500 text-sm uppercase tracking-wider flex-1 text-center">English</span>
              <div className="text-gray-300">
                <ArrowRightIcon size={16} />
              </div>
              <span className="font-semibold text-primary-600 text-sm uppercase tracking-wider flex-1 text-center">Thai</span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-gray-100 min-h-[300px]">
            
            {/* Input Section */}
            <div className="flex-1 p-6 relative group">
              <textarea
                ref={textareaRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type English text here..."
                className="w-full h-full min-h-[200px] resize-none bg-transparent border-none focus:ring-0 text-lg text-gray-700 placeholder-gray-300 outline-none leading-relaxed"
                spellCheck="false"
              />
              
              {inputText && (
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                   <Button variant="icon" onClick={handleClear} aria-label="Clear input">
                     <XIcon size={18} />
                   </Button>
                </div>
              )}

              <div className="absolute bottom-6 right-6">
                <Button 
                  onClick={handleTranslate} 
                  isLoading={isLoading}
                  disabled={!inputText.trim()}
                  className="rounded-full"
                >
                  Translate
                </Button>
              </div>
            </div>

            {/* Output Section */}
            <div className="flex-1 p-6 bg-primary-50/30 relative flex flex-col">
               {outputText ? (
                 <>
                  <div className="flex-grow font-thai text-xl leading-relaxed text-gray-800 animate-fade-in">
                    {outputText}
                  </div>
                  <div className="flex justify-end mt-4 pt-4 border-t border-primary-100/50">
                    <Button 
                      variant="secondary" 
                      onClick={handleCopy}
                      className={`text-sm py-1.5 px-3 rounded-lg border-transparent shadow-sm ${isCopied ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-white'}`}
                    >
                      {isCopied ? (
                        <span className="flex items-center gap-1.5"><CheckIcon size={16} /> Copied</span>
                      ) : (
                        <span className="flex items-center gap-1.5"><CopyIcon size={16} /> Copy</span>
                      )}
                    </Button>
                  </div>
                 </>
               ) : (
                 <div className="flex-grow flex flex-col items-center justify-center text-gray-300 gap-3 select-none">
                    <div className="p-4 bg-white rounded-full shadow-sm">
                      <SparklesIcon size={24} className="text-primary-200" />
                    </div>
                    <p className="text-sm font-medium">Translation will appear here</p>
                 </div>
               )}
            </div>
          </div>
        </div>

        {/* Instructions / Tip */}
        <div className="mt-4 flex justify-between items-center text-xs text-gray-400 px-2">
           <p>Tip: Press <span className="font-mono bg-gray-100 px-1 py-0.5 rounded border border-gray-200">Cmd</span> + <span className="font-mono bg-gray-100 px-1 py-0.5 rounded border border-gray-200">Enter</span> to translate quickly.</p>
        </div>

        {/* History Section */}
        {history.length > 0 && (
          <div className="mt-16 animate-fade-in-up">
            <div className="flex items-center justify-between mb-6 px-2">
              <h2 className="text-lg font-semibold text-gray-800">Recent Translations</h2>
              <button 
                onClick={clearHistory}
                className="text-xs font-medium text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors"
              >
                <TrashIcon size={14} /> Clear History
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {history.map((item) => (
                <div 
                  key={item.id} 
                  onClick={() => loadHistoryItem(item)}
                  className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-primary-200 cursor-pointer transition-all duration-200 group"
                >
                  <div className="flex flex-col gap-2">
                    <p className="text-gray-800 line-clamp-2 text-sm font-medium">{item.original}</p>
                    <div className="w-full h-px bg-gray-50 my-1 group-hover:bg-primary-50 transition-colors" />
                    <p className="text-primary-700 font-thai line-clamp-2 text-sm">{item.translated}</p>
                  </div>
                  <div className="mt-3 flex justify-between items-center">
                    <span className="text-[10px] text-gray-400">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="opacity-0 group-hover:opacity-100 text-[10px] font-bold text-primary-400 uppercase tracking-wide transition-opacity">
                      Restore
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-in-out;
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}

export default App;