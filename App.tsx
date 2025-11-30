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

      const newRecord: TranslationRecord = {
        id: Date.now().toString(),
        original: inputText,
        translated: translated,
        timestamp: Date.now(),
      };
      setHistory(prev => [newRecord, ...prev].slice(0, 10)); 
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      handleTranslate();
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-700 font-sans selection:bg-primary-100 selection:text-primary-900 pb-20">
      
      {/* Header */}
      <header className="fixed top-0 w-full z-20 bg-white/80 backdrop-blur-xl border-b border-gray-50">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 bg-primary-50 rounded-lg text-primary-600">
              <SparklesIcon size={18} />
            </div>
            <h1 className="text-lg font-semibold tracking-tight text-gray-900">
              Thai<span className="text-primary-600">Minima</span>
            </h1>
          </div>
          <div className="flex items-center gap-2">
             <span className="text-[10px] font-medium text-primary-400/80 px-2 py-1 bg-primary-50/50 rounded-md tracking-wide">
                AI POWERED
             </span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 pt-28 pb-12">
        
        {/* Main Translator Card */}
        <div className="bg-white rounded-[2rem] shadow-soft border border-primary-100/30 overflow-hidden transition-shadow hover:shadow-glow duration-500">
          
          {/* Language Indicator */}
          <div className="flex items-center justify-center py-4 bg-gradient-to-r from-white via-primary-50/30 to-white border-b border-primary-50/50">
            <div className="flex items-center gap-6 text-sm font-medium">
              <span className="text-gray-400">English</span>
              <div className="text-primary-300">
                <ArrowRightIcon size={14} />
              </div>
              <span className="text-primary-600">Thai</span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row min-h-[320px]">
            
            {/* Input Section */}
            <div className="flex-1 p-8 relative group">
              <textarea
                ref={textareaRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="What would you like to translate?"
                className="w-full h-full min-h-[200px] resize-none bg-transparent border-none focus:ring-0 text-xl text-gray-800 placeholder-gray-300 outline-none leading-relaxed font-light"
                spellCheck="false"
              />
              
              <div className={`absolute top-6 right-6 transition-all duration-300 ${inputText ? 'opacity-100' : 'opacity-0 scale-90 pointer-events-none'}`}>
                   <button onClick={handleClear} className="p-2 text-gray-300 hover:text-primary-500 hover:bg-primary-50 rounded-full transition-colors">
                     <XIcon size={18} />
                   </button>
              </div>

              <div className="absolute bottom-8 left-8 right-8 md:right-auto">
                <Button 
                  onClick={handleTranslate} 
                  isLoading={isLoading}
                  disabled={!inputText.trim()}
                  className="w-full md:w-auto shadow-primary-200/50 hover:shadow-primary-300/50"
                >
                  Translate
                </Button>
              </div>
            </div>

            {/* Divider */}
            <div className="hidden md:block w-px bg-gradient-to-b from-transparent via-primary-100/50 to-transparent"></div>
            <div className="md:hidden h-px bg-gradient-to-r from-transparent via-primary-100/50 to-transparent"></div>

            {/* Output Section */}
            <div className="flex-1 p-8 bg-primary-50/10 relative flex flex-col">
               {outputText ? (
                 <>
                  <div className="flex-grow font-thai text-xl leading-relaxed text-gray-800 animate-fade-in font-light">
                    {outputText}
                  </div>
                  <div className="flex justify-end mt-6 pt-6 border-t border-primary-100/30">
                    <Button 
                      variant="secondary" 
                      onClick={handleCopy}
                      className={`text-xs py-2 px-4 rounded-xl border-transparent ${isCopied ? 'bg-green-50 text-green-600' : 'bg-white shadow-sm text-gray-500 hover:text-primary-600'}`}
                    >
                      {isCopied ? (
                        <span className="flex items-center gap-1.5"><CheckIcon size={14} /> Copied</span>
                      ) : (
                        <span className="flex items-center gap-1.5"><CopyIcon size={14} /> Copy</span>
                      )}
                    </Button>
                  </div>
                 </>
               ) : (
                 <div className="flex-grow flex flex-col items-center justify-center text-gray-300 gap-4 select-none">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                      <SparklesIcon size={20} className="text-primary-200" />
                    </div>
                    <p className="text-sm font-light text-primary-200/70">Translation result</p>
                 </div>
               )}
            </div>
          </div>
        </div>

        {/* Tip */}
        <div className="mt-6 text-center">
           <p className="text-[10px] text-gray-400 font-light">Press <span className="font-mono text-primary-400">Cmd/Ctrl + Enter</span> to translate</p>
        </div>

        {/* History Section */}
        {history.length > 0 && (
          <div className="mt-20 animate-fade-in-up">
            <div className="flex items-center justify-between mb-8 px-2">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest">History</h2>
              <button 
                onClick={clearHistory}
                className="text-xs font-medium text-gray-300 hover:text-red-400 flex items-center gap-1.5 transition-colors group"
              >
                <TrashIcon size={12} /> <span className="group-hover:underline decoration-red-200 underline-offset-2">Clear</span>
              </button>
            </div>
            
            <div className="space-y-3">
              {history.map((item) => (
                <div 
                  key={item.id} 
                  onClick={() => loadHistoryItem(item)}
                  className="group bg-white p-5 rounded-2xl border border-transparent hover:border-primary-100 hover:shadow-soft cursor-pointer transition-all duration-300 flex items-center justify-between gap-4"
                >
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    <p className="text-gray-600 text-sm font-light truncate">{item.original}</p>
                    <div className="hidden md:block w-px h-4 bg-primary-100/50 justify-self-center"></div>
                    <p className="text-primary-700 font-thai text-sm truncate">{item.translated}</p>
                  </div>
                  <div className="text-primary-200 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                    <ArrowRightIcon size={16} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
      `}</style>
    </div>
  );
}

export default App;