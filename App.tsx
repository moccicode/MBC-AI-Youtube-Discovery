
import React, { useState } from 'react';
import { searchVideos, fetchComments } from './services/youtubeService';
import { analyzeContent } from './services/geminiService';
import { YouTubeVideo, AnalysisResult } from './types';
import VideoCard from './components/VideoCard';
import InsightPanel from './components/InsightPanel';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const App: React.FC = () => {
  const [query, setQuery] = useState('');
  const [duration, setDuration] = useState<'any' | 'short' | 'medium' | 'long'>('any');
  const [minRatio, setMinRatio] = useState<number>(1.0); // Default to at least 1:1
  
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  
  const [youtubeKey, setYoutubeKey] = useState<string>(() => localStorage.getItem('youtube_api_key') || '');
  const [showKey, setShowKey] = useState(false);

  const saveYouTubeKey = (key: string) => {
    setYoutubeKey(key);
    localStorage.setItem('youtube_api_key', key);
  };

  const handleOpenGeminiKey = async () => {
    try {
      if (window.aistudio?.openSelectKey) {
        await window.aistudio.openSelectKey();
      } else {
        alert("Gemini key selection is only available in the AI Studio environment.");
      }
    } catch (e) { console.error(e); }
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;
    if (!youtubeKey) { alert("Please provide a YouTube Data API key in the toolbar."); return; }

    setLoading(true);
    setVideos([]);
    try {
      const results = await searchVideos(query, youtubeKey, duration);
      // Filter by Viral Ratio (viewCount / subscriberCount)
      const filtered = results.filter(v => (v.performanceRatio || 0) >= minRatio);
      setVideos(filtered);
      
      if (filtered.length === 0 && results.length > 0) {
        alert("No videos met your Viral Ratio threshold. Try lowering it.");
      }
    } catch (error: any) {
      alert(error.message || "Failed to search. Check your YouTube API Key.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async (video: YouTubeVideo) => {
    setSelectedVideo(video);
    setAnalyzing(true);
    try {
      const comments = await fetchComments(video.id, youtubeKey);
      const result = await analyzeContent(video, comments);
      setAnalysisResult(result);
    } catch (error: any) {
      alert("Analysis failed. Please check your Gemini connection.");
      setSelectedVideo(null);
    } finally {
      setAnalyzing(false);
    }
  };

  const chartData = videos.map(v => ({
    name: v.channelTitle.length > 8 ? v.channelTitle.substring(0, 6) + '..' : v.channelTitle,
    ratio: v.performanceRatio,
    fullName: v.channelTitle
  })).sort((a, b) => (b.ratio || 0) - (a.ratio || 0));

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="sticky top-0 z-40">
        <header className="glass border-b border-white/40">
          <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 shrink-0">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-xl flex items-center justify-center text-white shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m16.07 15.07 4.24 4.24"/><circle cx="11" cy="11" r="8"/></svg>
              </div>
              <h1 className="text-lg font-black text-slate-900 tracking-tight hidden sm:block">Insight <span className="text-indigo-600">AI</span></h1>
            </div>
            
            <form onSubmit={handleSearch} className="flex-1 max-w-xl relative group mx-4">
              <input 
                type="text" 
                placeholder="Search niche (e.g., 'cooking shorts', 'tech review')..." 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full h-11 px-5 bg-white/80 rounded-xl border border-slate-200 focus:bg-white focus:border-indigo-500 outline-none pl-11 shadow-sm transition-all"
              />
              <svg className="absolute left-4 top-3 text-slate-400 group-focus-within:text-indigo-500 transition-colors" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </form>

            <button 
              onClick={handleOpenGeminiKey}
              className="bg-slate-900 text-white text-[10px] font-black h-10 px-5 rounded-xl shadow-xl shadow-slate-200 hover:bg-indigo-600 transition-all active:scale-95 flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 2v2"/><path d="M12 20v2"/><path d="M2 12h2"/><path d="M20 12h2"/></svg>
              GEMINI KEY
            </button>
          </div>
        </header>

        {/* Control Toolbar */}
        <div className="bg-white border-b border-slate-100 shadow-sm">
          <div className="max-w-[1400px] mx-auto px-6 h-14 flex items-center justify-between gap-8 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-8 shrink-0">
              {/* Type Toggle */}
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Video Type:</span>
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  {(['any', 'short', 'long'] as const).map((d) => (
                    <button
                      key={d}
                      onClick={() => setDuration(d)}
                      className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all uppercase tracking-tight ${
                        duration === d ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      {d === 'any' ? 'All' : d === 'short' ? 'Shorts (<4m)' : 'Long (>20m)'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Viral Slider */}
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Viral Threshold:</span>
                <div className="flex items-center gap-3">
                  <input 
                    type="range" min="0" max="10" step="0.5" 
                    value={minRatio} 
                    onChange={(e) => setMinRatio(parseFloat(e.target.value))}
                    className="w-32 accent-indigo-600 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className={`text-xs font-black px-2 py-0.5 rounded-md ${minRatio > 3 ? 'bg-rose-100 text-rose-600' : 'bg-indigo-100 text-indigo-600'}`}>
                    {minRatio.toFixed(1)}x
                  </span>
                </div>
              </div>
            </div>

            {/* YouTube API Visibility */}
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">YouTube API:</span>
              <div className="relative group">
                <input 
                  type={showKey ? "text" : "password"}
                  value={youtubeKey}
                  onChange={(e) => saveYouTubeKey(e.target.value)}
                  onFocus={() => setShowKey(true)}
                  onBlur={() => setShowKey(false)}
                  placeholder="Paste API Key..."
                  className="bg-slate-50 border border-slate-100 text-[10px] font-mono w-32 px-3 py-1.5 rounded-lg focus:w-64 transition-all outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-[1400px] mx-auto px-6 mt-8 pb-32">
        {/* Analytics Summary Chart */}
        {videos.length > 0 && (
          <div className="mb-10 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 h-[280px]">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Competitor Viral Efficiency</h2>
                <div className="text-[10px] font-bold text-slate-400 uppercase">View-to-Subscriber Ratio</div>
             </div>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" fontSize={10} fontWeight={800} tickLine={false} axisLine={false} dy={10} />
                <YAxis fontSize={10} fontWeight={800} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: '#f1f5f9', radius: 10 }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="ratio" radius={[10, 10, 4, 4]} barSize={36}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={(entry.ratio || 0) > 3 ? '#f43f5e' : '#6366f1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Grid Results */}
        {loading ? (
          <div className="py-40 flex flex-col items-center">
            <div className="relative w-20 h-20 mb-8">
              <div className="absolute inset-0 border-8 border-slate-100 rounded-full"></div>
              <div className="absolute inset-0 border-8 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Sourcing Viral Data</h3>
            <p className="text-slate-500 font-medium mt-2 tracking-wide">Filtering by {duration} format and {minRatio}x ratio...</p>
          </div>
        ) : videos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {videos.map(v => (
              <VideoCard key={v.id} video={v} onAnalyze={handleAnalyze} />
            ))}
          </div>
        ) : (
          <div className="py-60 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
            <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8">
              <svg className="text-slate-300" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="m21 21-4.3-4.3"/><circle cx="11" cy="11" r="8"/></svg>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Discover Next Viral Topic</h2>
            <p className="text-slate-500 font-medium max-w-xs mx-auto mt-2">
              Select your format and viral threshold above to start finding content that works.
            </p>
          </div>
        )}
      </main>

      {/* Analysis Fullscreen Loading */}
      {analyzing && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/95 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="w-24 h-24 bg-indigo-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-indigo-200 animate-bounce">
            <svg className="text-white animate-spin" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"><path d="M12 2v4"/><path d="M12 18v4"/><path d="M4.93 4.93l2.83 2.83"/><path d="M16.24 16.24l2.83 2.83"/><path d="M2 12h4"/><path d="M18 12h4"/><path d="M4.93 19.07l2.83-2.83"/><path d="M16.24 7.76l2.83-2.83"/></svg>
          </div>
          <h2 className="mt-10 text-3xl font-black text-slate-900 tracking-tight text-center">AI Strategic Brainstorming</h2>
          <div className="flex gap-2 mt-4">
             {[0,1,2].map(i => <div key={i} className="w-3 h-3 bg-indigo-600 rounded-full animate-pulse" style={{ animationDelay: `${i*0.2}s` }}></div>)}
          </div>
          <p className="mt-6 text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px]">Processing Comment Psychology...</p>
        </div>
      )}

      {selectedVideo && analysisResult && (
        <InsightPanel 
          video={selectedVideo} 
          result={analysisResult} 
          onClose={() => { setSelectedVideo(null); setAnalysisResult(null); }} 
        />
      )}
      
      <div className="fixed bottom-6 right-6 z-30">
        <div className="px-5 py-3 bg-slate-900 text-white rounded-2xl shadow-2xl flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[10px] font-black uppercase tracking-widest">Core Engine Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
