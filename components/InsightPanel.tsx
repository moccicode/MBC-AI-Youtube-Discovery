
import React, { useState } from 'react';
import { AnalysisResult, YouTubeVideo, ScriptOutline } from '../types';
import { generateScriptOutline } from '../services/geminiService';

interface InsightPanelProps {
  video: YouTubeVideo;
  result: AnalysisResult;
  onClose: () => void;
}

const InsightPanel: React.FC<InsightPanelProps> = ({ video, result, onClose }) => {
  const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null);
  const [outline, setOutline] = useState<ScriptOutline | null>(null);
  const [loadingOutline, setLoadingOutline] = useState(false);

  const handleKeywordClick = async (keyword: string) => {
    setSelectedKeyword(keyword);
    setLoadingOutline(true);
    setOutline(null);
    try {
      const generated = await generateScriptOutline(keyword, video.title);
      setOutline(generated);
    } catch (err) {
      console.error(err);
      alert("Failed to generate outline. Please try again.");
    } finally {
      setLoadingOutline(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-6xl max-h-[92vh] overflow-hidden rounded-[3rem] shadow-2xl flex flex-col slide-in-from-bottom-10 border border-white/20">
        
        {/* Header */}
        <div className="px-10 py-8 border-b border-slate-100 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-indigo-600 rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl shadow-indigo-200">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="m17 17-5 5-5-5"/><path d="m17 7-5-5-5 5"/></svg>
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 leading-tight" dangerouslySetInnerHTML={{ __html: video.title }}></h2>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-md">Strategic Analysis Report</span>
                <span className="text-slate-300">•</span>
                <span className="text-xs font-bold text-slate-400">{video.channelTitle}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-100 rounded-2xl transition-all text-slate-400 hover:text-slate-900">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-grow overflow-y-auto bg-slate-50/50">
          <div className="grid grid-cols-1 lg:grid-cols-12 h-full">
            
            {/* Left Col: Reactions & 5 Strong Keywords */}
            <div className="lg:col-span-4 p-10 space-y-10 bg-white border-r border-slate-100">
              {/* Audience Reactions */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Audience Reactions</h3>
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-full uppercase tracking-tighter">
                    {result.audienceSentiment}
                  </span>
                </div>
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100/50">
                   <p className="text-sm font-medium text-slate-700 leading-relaxed italic">"{result.summary}"</p>
                </div>
              </section>

              {/* Top 5 Keywords */}
              <section>
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">5 Strong Recommended Keywords</h3>
                <div className="space-y-3">
                  {result.topKeywords.map((kw, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleKeywordClick(kw)}
                      className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl border-2 text-left transition-all active:scale-[0.97] ${
                        selectedKeyword === kw 
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100' 
                        : 'bg-white border-slate-100 text-slate-600 hover:border-indigo-300 hover:shadow-lg hover:shadow-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <span className={`text-xs font-black ${selectedKeyword === kw ? 'text-indigo-200' : 'text-slate-300'}`}>0{idx+1}</span>
                        <span className="font-extrabold text-sm tracking-tight">#{kw}</span>
                      </div>
                      <svg className={`opacity-0 transition-opacity ${selectedKeyword === kw ? 'opacity-100' : ''}`} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                    </button>
                  ))}
                </div>
                <div className="mt-6 flex items-start gap-3 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                  <svg className="text-indigo-600 shrink-0" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
                  <p className="text-[10px] font-bold text-indigo-700 leading-tight">
                    Each keyword is selected based on audience demand. Click one to generate an instant script outline.
                  </p>
                </div>
              </section>
            </div>

            {/* Right Col: Topic Recommendations or Script Outline */}
            <div className="lg:col-span-8 p-10">
              {loadingOutline ? (
                <div className="h-full flex flex-col items-center justify-center py-20">
                  <div className="w-20 h-20 relative mb-8">
                     <div className="absolute inset-0 border-8 border-slate-100 rounded-full"></div>
                     <div className="absolute inset-0 border-8 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Creating Script Blueprint</h3>
                  <p className="text-slate-500 font-medium mt-2">Drafting sections for #{selectedKeyword}...</p>
                </div>
              ) : outline ? (
                <div className="animate-in slide-in-from-right-10 duration-500">
                  <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M8 7h6"/><path d="M8 11h8"/></svg>
                      </div>
                      <h3 className="text-3xl font-black text-slate-900 tracking-tight">{outline.title}</h3>
                    </div>
                    <button 
                      onClick={() => setOutline(null)}
                      className="px-4 py-2 bg-slate-100 text-slate-500 hover:text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                      Show Other Recommendations
                    </button>
                  </div>

                  <div className="space-y-6">
                    {outline.sections.map((sec, idx) => (
                      <div key={idx} className="group flex gap-8">
                        <div className="pt-1 flex flex-col items-center gap-2">
                           <div className="w-10 h-10 rounded-full border-2 border-indigo-100 flex items-center justify-center text-xs font-black text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                             {idx + 1}
                           </div>
                           <div className="flex-grow w-0.5 bg-slate-100 group-last:hidden"></div>
                        </div>
                        <div className="flex-grow pb-8">
                          <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-3">{sec.heading}</h4>
                          <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm group-hover:border-indigo-100 group-hover:shadow-lg transition-all">
                             <p className="text-slate-600 font-medium leading-relaxed whitespace-pre-wrap">{sec.content}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-10 animate-in fade-in duration-500">
                  <section>
                     <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-6 flex items-center gap-3">
                       <span className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs">💡</span>
                       Content Strategy: 3 Recommended Topics
                     </h3>
                     <div className="grid grid-cols-1 gap-6">
                        {result.suggestedTopics.map((topic, i) => (
                          <div key={i} className="group bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-indigo-100/20 hover:-translate-y-1 transition-all">
                             <div className="flex justify-between items-start mb-4">
                               <h4 className="text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{topic.title}</h4>
                               <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Topic {i+1}</span>
                             </div>
                             <p className="text-sm font-bold text-slate-500 leading-relaxed mb-6">
                               <span className="text-slate-800">Strategy:</span> {topic.reasoning}
                             </p>
                             <div className="p-5 bg-indigo-50 rounded-2xl border border-indigo-100">
                                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block mb-1">Recommended Hook</span>
                                <p className="text-sm font-extrabold text-indigo-800">"{topic.hookIdea}"</p>
                             </div>
                          </div>
                        ))}
                     </div>
                  </section>

                  <section className="bg-slate-900 p-10 rounded-[3rem] text-white relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px]"></div>
                     <div className="relative z-10">
                        <h4 className="text-xs font-black uppercase tracking-[0.3em] text-indigo-400 mb-2">Audience Questions</h4>
                        <h3 className="text-2xl font-black mb-6">Address these for instant value</h3>
                        <div className="space-y-4">
                           {result.commonQuestions.map((q, i) => (
                             <div key={i} className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                                <span className="w-8 h-8 bg-indigo-500 rounded-xl flex items-center justify-center font-black text-xs shrink-0">Q</span>
                                <p className="text-sm font-bold opacity-90">{q}</p>
                             </div>
                           ))}
                        </div>
                     </div>
                  </section>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="px-10 py-6 border-t border-slate-100 bg-white flex justify-end shrink-0">
          <button onClick={onClose} className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs tracking-widest hover:bg-indigo-600 transition-all active:scale-95 shadow-xl shadow-slate-200">
            CLOSE REPORT
          </button>
        </div>
      </div>
    </div>
  );
};

export default InsightPanel;
