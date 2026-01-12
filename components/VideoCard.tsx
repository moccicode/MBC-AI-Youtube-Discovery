
import React from 'react';
import { YouTubeVideo } from '../types';

interface VideoCardProps {
  video: YouTubeVideo;
  onAnalyze: (video: YouTubeVideo) => void;
}

const VideoCard: React.FC<VideoCardProps> = ({ video, onAnalyze }) => {
  const ratio = video.performanceRatio || 0;
  const views = video.statistics?.viewCount || 0;
  const subs = video.channelStats?.subscriberCount || 0;
  
  const getPerformanceStyle = (r: number) => {
    if (r > 10) return "from-rose-500 to-red-600 shadow-rose-200 text-white";
    if (r > 3) return "from-amber-500 to-orange-600 shadow-orange-200 text-white";
    if (r > 1) return "from-blue-500 to-indigo-600 shadow-blue-200 text-white";
    return "bg-slate-100 text-slate-600 shadow-transparent";
  };

  const getPerformanceLabel = (r: number) => {
    if (r > 10) return "Mega Viral";
    if (r > 3) return "Breakout";
    if (r > 1) return "Healthy";
    return "Baseline";
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString();
  };

  const performanceClass = getPerformanceStyle(ratio);

  return (
    <div className="group bg-white rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
      <div className="relative aspect-video overflow-hidden">
        <img 
          src={video.thumbnail} 
          alt={video.title} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
        />
        <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-gradient-to-br shadow-lg ${performanceClass}`}>
          {getPerformanceLabel(ratio)}
        </div>
      </div>
      
      <div className="p-5 flex-grow flex flex-col">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400">
            {video.channelTitle.charAt(0)}
          </div>
          <span className="text-xs font-semibold text-slate-500 truncate">{video.channelTitle}</span>
        </div>

        <h3 
          className="font-bold text-sm leading-snug line-clamp-2 mb-4 group-hover:text-indigo-600 transition-colors" 
          dangerouslySetInnerHTML={{ __html: video.title }}
        ></h3>
        
        <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <div>
            <span className="block text-[9px] uppercase tracking-wider text-slate-400 font-bold mb-0.5">Views</span>
            <span className="font-bold text-slate-700">{formatNumber(views)}</span>
          </div>
          <div>
            <span className="block text-[9px] uppercase tracking-wider text-slate-400 font-bold mb-0.5">Subscribers</span>
            <span className="font-bold text-slate-700">{formatNumber(subs)}</span>
          </div>
          <div className="col-span-2 pt-2 border-t border-slate-200/60 flex justify-between items-center">
            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">V-to-S Efficiency</span>
            <span className={`font-extrabold text-sm ${ratio > 3 ? 'text-rose-600' : 'text-slate-900'}`}>
              {ratio.toFixed(2)}x
            </span>
          </div>
        </div>

        <button 
          onClick={() => onAnalyze(video)}
          className="mt-auto w-full py-3 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-indigo-600 hover:shadow-lg hover:shadow-indigo-200 transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v8"/><path d="m16 6-4 4-4-4"/><rect width="20" height="8" x="2" y="14" rx="2"/><path d="M6 18h.01"/><path d="M10 18h.01"/></svg>
          Deep Insight Analysis
        </button>
      </div>
    </div>
  );
};

export default VideoCard;
