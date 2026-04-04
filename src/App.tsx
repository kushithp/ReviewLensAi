import React, { useState } from 'react';
import { Search, Link as LinkIcon, FileText, Sparkles, ArrowRight, CheckCircle2, XCircle, Star, Download, Copy, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI, Type } from "@google/genai";
import { analyze } from './services/api';
import { AnalysisResult } from './types';
import { cn } from './lib/utils';

// --- Components ---

const Navbar = () => (
  <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
        <Sparkles className="text-white w-5 h-5" />
      </div>
      <span className="font-bold text-xl tracking-tight text-gray-900">ReviewLens AI</span>
    </div>
    <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
      <a href="#" className="hover:text-indigo-600 transition-colors">Features</a>
      <a href="#" className="hover:text-indigo-600 transition-colors">Pricing</a>
      <a href="#" className="hover:text-indigo-600 transition-colors">API</a>
      <button className="bg-gray-900 text-white px-4 py-2 rounded-full hover:bg-gray-800 transition-all shadow-sm">
        Get Started
      </button>
    </div>
  </nav>
);

const Skeleton = ({ className }: { className?: string }) => (
  <div className={cn("animate-pulse bg-gray-200 rounded", className)} />
);

const ResultCard = ({ result, onReset }: { result: AnalysisResult; onReset: () => void }) => {
  const [copied, setCopied] = useState(false);
  const [summaryCopied, setSummaryCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copySummary = () => {
    navigator.clipboard.writeText(result.summary);
    setSummaryCopied(true);
    setTimeout(() => setSummaryCopied(false), 2000);
  };

  const downloadSummary = () => {
    const content = `Product: ${result.product_name}\nRating: ${result.rating}/5\n\nSummary:\n${result.summary}\n\nOverall Pros:\n${result.overall_pros.join('\n')}\n\nOverall Cons:\n${result.overall_cons.join('\n')}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${result.product_name.replace(/\s+/g, '_')}_analysis.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const listContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const listItem = {
    hidden: { opacity: 0, x: -10 },
    show: { opacity: 1, x: 0 }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-8 pb-20"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-3xl font-bold text-gray-900">{result.product_name}</h2>
            {result.platform && result.platform !== 'unknown' && (
              <span className={cn(
                "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                result.platform === 'amazon' ? "bg-[#FF9900] text-white" : "bg-[#2874F0] text-white"
              )}>
                {result.platform}
              </span>
            )}
            {result.is_fallback && (
              <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-[10px] font-bold uppercase tracking-wider border border-amber-200">
                Demo Mode
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-2">
              <div className="flex items-center text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={cn("w-5 h-5 fill-current", i >= Math.round(result.rating) && "text-gray-300 fill-none")} />
                ))}
              </div>
              <span className="text-sm font-semibold text-gray-600">{result.rating}/5</span>
            </div>
            <span className="text-sm text-gray-400">Based on {result.total_reviews} reviews</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={copyToClipboard} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 flex items-center gap-2" title="Copy JSON">
            {copied ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
            {copied && <span className="text-xs font-medium text-green-500">Copied!</span>}
          </button>
          <button onClick={downloadSummary} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600" title="Download Analysis">
            <Download className="w-5 h-5" />
          </button>
          <button onClick={onReset} className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg font-medium hover:bg-indigo-100 transition-colors">
            <RefreshCw className="w-4 h-4" />
            New Analysis
          </button>
        </div>
      </div>

      <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative group">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            AI Summary
          </h3>
          <button onClick={copySummary} className="text-xs text-indigo-600 font-bold hover:underline opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
            {summaryCopied ? <CheckCircle2 className="w-3 h-3" /> : null}
            {summaryCopied ? 'Copied!' : 'Copy Summary'}
          </button>
        </div>
        <p className="text-gray-600 leading-relaxed text-lg italic">"{result.summary}"</p>
        <div className="mt-4 pt-4 border-t border-gray-50 flex items-center gap-2">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Key Focus:</span>
          <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-bold uppercase tracking-wider">
            {result.most_mentioned_aspect}
          </span>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-green-50/50 p-6 rounded-2xl border border-green-100">
          <h3 className="text-green-800 font-bold mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            Overall Pros
          </h3>
          <motion.ul 
            variants={listContainer}
            initial="hidden"
            animate="show"
            className="space-y-2"
          >
            {result.overall_pros.map((pro, i) => (
              <motion.li 
                key={i} 
                variants={listItem}
                className="flex items-start gap-2 text-green-700"
              >
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
                {pro}
              </motion.li>
            ))}
          </motion.ul>
        </div>
        <div className="bg-red-50/50 p-6 rounded-2xl border border-red-100">
          <h3 className="text-red-800 font-bold mb-4 flex items-center gap-2">
            <XCircle className="w-5 h-5" />
            Overall Cons
          </h3>
          <motion.ul 
            variants={listContainer}
            initial="hidden"
            animate="show"
            className="space-y-2"
          >
            {result.overall_cons.map((con, i) => (
              <motion.li 
                key={i} 
                variants={listItem}
                className="flex items-start gap-2 text-red-700"
              >
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                {con}
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-bold text-gray-900">Aspect Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {result.aspects.map((aspect, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -4, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)" }}
              transition={{ 
                delay: i * 0.05,
                type: "spring",
                stiffness: 300,
                damping: 20
              }}
              className={cn(
                "bg-white p-5 rounded-xl border transition-colors",
                aspect.name === result.most_mentioned_aspect 
                  ? "border-indigo-200 shadow-indigo-50 shadow-lg ring-1 ring-indigo-100" 
                  : "border-gray-100 shadow-sm"
              )}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-gray-900">{aspect.name}</h4>
                  {aspect.name === result.most_mentioned_aspect && (
                    <span className="text-[10px] bg-indigo-600 text-white px-1.5 py-0.5 rounded font-bold uppercase tracking-tighter">Hot</span>
                  )}
                </div>
              </div>
              <div className="space-y-3">
                {aspect.pros.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest block mb-1">Pros</span>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {aspect.pros.map((p, idx) => <li key={idx}>• {p}</li>)}
                    </ul>
                  </div>
                )}
                {aspect.cons.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold text-red-600 uppercase tracking-widest block mb-1">Cons</span>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {aspect.cons.map((c, idx) => <li key={idx}>• {c}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

// --- Main App ---

export default function App() {
  const [inputMode, setInputMode] = useState<'text' | 'link'>('text');
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const detectPlatform = (url: string): 'amazon' | 'flipkart' | 'unknown' => {
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes('amazon.')) return 'amazon';
    if (lowerUrl.includes('flipkart.com')) return 'flipkart';
    return 'unknown';
  };

  const platform = inputMode === 'link' ? detectPlatform(inputValue) : 'unknown';

  const handleAnalyze = async () => {
    if (!inputValue.trim()) return;
    
    setResult(null);
    setIsLoading(true);
    setError(null);
    try {
      // 1. Get scraped data from backend
      const scraped = await analyze(inputValue, inputMode === 'link' ? 'url' : 'text');
      
      // 2. Process with AI on frontend
      const apiKey = (import.meta as any).env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
      const openAiKey = (import.meta as any).env.OPENAI_API_KEY || process.env.OPENAI_API_KEY;
      console.log("Gemini API Key present:", !!apiKey, "OpenAI API Key present:", !!openAiKey);
      
      if (!apiKey || apiKey === 'your_api_key_here' || apiKey === 'undefined') {
        throw new Error("Gemini API key is missing or invalid. Please set GEMINI_API_KEY in your environment variables.");
      }

      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Analyze the following product reviews for "${scraped.productName}" from ${scraped.platform} and provide a STRICT JSON response.
      
      Reviews:
      ${scraped.reviews.slice(0, 8000)}
      
      Required JSON Structure:
      {
        "product_name": "string",
        "rating": number (0-5),
        "total_reviews": number,
        "aspects": [
          {
            "name": "string (e.g., Battery, Design)",
            "pros": ["string"],
            "cons": ["string"]
          }
        ],
        "overall_pros": ["string"],
        "overall_cons": ["string"],
        "summary": "string (concise)",
        "most_mentioned_aspect": "string"
      }`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              product_name: { type: Type.STRING },
              rating: { type: Type.NUMBER },
              total_reviews: { type: Type.INTEGER },
              aspects: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    pros: { type: Type.ARRAY, items: { type: Type.STRING } },
                    cons: { type: Type.ARRAY, items: { type: Type.STRING } }
                  },
                  required: ["name", "pros", "cons"]
                }
              },
              overall_pros: { type: Type.ARRAY, items: { type: Type.STRING } },
              overall_cons: { type: Type.ARRAY, items: { type: Type.STRING } },
              summary: { type: Type.STRING },
              most_mentioned_aspect: { type: Type.STRING }
            },
            required: ["product_name", "rating", "total_reviews", "aspects", "overall_pros", "overall_cons", "summary", "most_mentioned_aspect"]
          }
        }
      });

      const aiResult = JSON.parse(response.text || "{}");
      setResult({
        ...aiResult,
        platform: scraped.platform,
        is_fallback: scraped.isFallback
      });
    } catch (err: any) {
      console.error("Analysis Error:", err);
      let userMessage = err.message || "Something went wrong. Please try again.";
      
      if (userMessage.includes("404")) {
        userMessage = "The product link could not be found. Please double-check the URL.";
      } else if (userMessage.includes("API key")) {
        userMessage = "There was an issue with the AI service. Please check your GEMINI_API_KEY.";
      } else if (userMessage.includes("Network Error")) {
        userMessage = "Could not connect to the server. Please check your internet connection.";
      }
      
      setError(userMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans text-gray-900">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 pt-12 md:pt-20">
        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div 
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-3xl mx-auto text-center space-y-8"
            >
              <div className="space-y-4">
                <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900">
                  Understand every <span className="text-indigo-600">review</span> instantly.
                </h1>
                <p className="text-xl text-gray-500 max-w-2xl mx-auto">
                  ReviewLens AI extracts key aspects, pros, and cons from thousands of reviews in seconds. Paste a link or raw text to get started.
                </p>
              </div>

              <div className="bg-white p-2 rounded-2xl shadow-xl border border-gray-100">
                <div className="flex p-1 bg-gray-50 rounded-xl mb-2">
                  <button 
                    onClick={() => setInputMode('text')}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all",
                      inputMode === 'text' ? "bg-white shadow-sm text-indigo-600" : "text-gray-500 hover:text-gray-700"
                    )}
                  >
                    <FileText className="w-4 h-4" />
                    Raw Text
                  </button>
                  <button 
                    onClick={() => setInputMode('link')}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all",
                      inputMode === 'link' ? "bg-white shadow-sm text-indigo-600" : "text-gray-500 hover:text-gray-700"
                    )}
                  >
                    <LinkIcon className="w-4 h-4" />
                    Product Link
                  </button>
                </div>

                <div className="relative">
                  {inputMode === 'text' ? (
                    <textarea 
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Paste product reviews here..."
                      className="w-full h-48 p-4 bg-transparent border-none focus:ring-0 text-gray-700 resize-none placeholder:text-gray-400"
                    />
                  ) : (
                    <div className="flex items-center px-4 py-8">
                      <LinkIcon className="w-5 h-5 text-gray-400 mr-3" />
                      <input 
                        type="url"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="https://amazon.com/product-url..."
                        className="flex-1 bg-transparent border-none focus:ring-0 text-gray-700 placeholder:text-gray-400 text-lg"
                      />
                    </div>
                  )}
                </div>

                <div className="p-2 border-t border-gray-50 flex items-center justify-between">
                  <div className="flex gap-2 ml-2">
                    <button 
                      onClick={() => { setInputValue('https://www.amazon.in/dp/B0CHX1W1XY'); setInputMode('link'); }}
                      className="px-2 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider hover:text-indigo-600 transition-colors"
                    >
                      Try Amazon
                    </button>
                    <button 
                      onClick={() => { setInputValue('https://www.flipkart.com/apple-iphone-15-black-128-gb/p/itm6ac6485515ae4'); setInputMode('link'); }}
                      className="px-2 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider hover:text-indigo-600 transition-colors"
                    >
                      Try Flipkart
                    </button>
                  </div>
                  <button 
                    onClick={handleAnalyze}
                    disabled={isLoading || !inputValue.trim()}
                    className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-indigo-200"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        Analyze Now
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-6 bg-red-50 rounded-2xl border border-red-100 text-left space-y-4 shadow-sm"
                >
                  <div className="flex items-center gap-3 text-red-700">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <XCircle className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Analysis Failed</h3>
                      <p className="text-sm opacity-90">{error}</p>
                    </div>
                  </div>
                  
                  <div className="bg-white/50 rounded-xl p-4 space-y-3 border border-red-200/50">
                    <h4 className="text-xs font-bold text-red-800 uppercase tracking-widest flex items-center gap-2">
                      <Sparkles className="w-3 h-3" />
                      Suggested Solutions
                    </h4>
                    <ul className="text-sm text-red-700 space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="mt-1 w-1 h-1 rounded-full bg-red-400 flex-shrink-0" />
                        <span><strong>Check API Keys:</strong> Ensure your Gemini API key is correctly set in the environment.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-1 w-1 h-1 rounded-full bg-red-400 flex-shrink-0" />
                        <span><strong>Try a Different Link:</strong> Some product pages might be protected or have unusual structures.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-1 w-1 h-1 rounded-full bg-red-400 flex-shrink-0" />
                        <span><strong>Use Raw Text:</strong> If the link fails, try copying and pasting the reviews directly into the "Raw Text" mode.</span>
                      </li>
                    </ul>
                  </div>
                  
                  <button 
                    onClick={() => setError(null)}
                    className="text-xs font-bold text-red-600 hover:text-red-800 transition-colors uppercase tracking-widest"
                  >
                    Dismiss Error
                  </button>
                </motion.div>
              )}

              <div className="pt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                {[
                  { icon: Sparkles, title: "AI Powered", desc: "Uses Gemini 2.0 for deep semantic understanding." },
                  { icon: CheckCircle2, title: "Aspect Extraction", desc: "Automatically identifies battery, design, price, etc." },
                  { icon: Search, title: "Sentiment Analysis", desc: "Know exactly how users feel about each feature." }
                ].map((feature, i) => (
                  <div key={i} className="space-y-2">
                    <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                      <feature.icon className="w-5 h-5 text-indigo-600" />
                    </div>
                    <h3 className="font-bold text-gray-900">{feature.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <ResultCard result={result} onReset={() => { setResult(null); setInputValue(''); }} />
          )}
        </AnimatePresence>
      </main>

      {isLoading && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-[100] flex items-center justify-center">
          <div className="max-w-md w-full px-6 space-y-8 text-center">
            <div className="relative w-24 h-24 mx-auto">
              <div className="absolute inset-0 border-4 border-indigo-100 rounded-full" />
              <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin" />
              <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-indigo-600 animate-pulse" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">
                {platform !== 'unknown' ? `Analyzing ${platform.charAt(0).toUpperCase() + platform.slice(1)} reviews...` : 'Analyzing Reviews...'}
              </h2>
              <p className="text-gray-500">Our AI is extracting aspects, sentiment, and key takeaways. This usually takes 5-10 seconds.</p>
            </div>
            <div className="space-y-4">
              <Skeleton className="h-4 w-3/4 mx-auto" />
              <Skeleton className="h-4 w-1/2 mx-auto" />
              <Skeleton className="h-4 w-2/3 mx-auto" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
