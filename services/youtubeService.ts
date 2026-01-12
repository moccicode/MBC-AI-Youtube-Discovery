
import { YouTubeVideo, CommentData } from '../types';

export const searchVideos = async (
  query: string, 
  apiKey: string, 
  duration: 'any' | 'short' | 'medium' | 'long' = 'any'
): Promise<YouTubeVideo[]> => {
  if (!apiKey) throw new Error("YouTube API Key is missing");
  
  // YouTube API 'short' is < 4 mins, 'medium' is 4-20, 'long' is > 20
  const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=25&q=${encodeURIComponent(query)}&type=video&videoDuration=${duration}&key=${apiKey}`;
  
  const response = await fetch(searchUrl);
  const data = await response.json();
  
  if (data.error) throw new Error(data.error.message);
  if (!data.items) return [];

  const videoIds = data.items.map((item: any) => item.id.videoId).join(',');
  const statsUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${videoIds}&key=${apiKey}`;
  
  const statsResponse = await fetch(statsUrl);
  const statsData = await statsResponse.json();

  const channelIds = statsData.items.map((item: any) => item.snippet.channelId).join(',');
  const channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelIds}&key=${apiKey}`;
  
  const channelResponse = await fetch(channelUrl);
  const channelData = await channelResponse.json();

  const channelsMap = new Map();
  channelData.items.forEach((c: any) => {
    channelsMap.set(c.id, {
      subscriberCount: parseInt(c.statistics.subscriberCount) || 0
    });
  });

  return statsData.items.map((item: any) => {
    const viewCount = parseInt(item.statistics.viewCount) || 0;
    const channelStats = channelsMap.get(item.snippet.channelId);
    const subCount = channelStats?.subscriberCount || 1;
    
    return {
      id: item.id,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.high.url,
      channelId: item.snippet.channelId,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
      statistics: {
        viewCount,
        likeCount: parseInt(item.statistics.likeCount) || 0,
        commentCount: parseInt(item.statistics.commentCount) || 0,
      },
      channelStats,
      performanceRatio: viewCount / subCount
    };
  });
};

export const fetchComments = async (videoId: string, apiKey: string): Promise<CommentData[]> => {
  if (!apiKey) throw new Error("YouTube API Key is missing");
  
  const url = `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&maxResults=50&videoId=${videoId}&key=${apiKey}`;
  const response = await fetch(url);
  const data = await response.json();
  
  if (data.error) throw new Error(data.error.message);
  if (!data.items) return [];

  return data.items.map((item: any) => ({
    text: item.snippet.topLevelComment.snippet.textDisplay,
    author: item.snippet.topLevelComment.snippet.authorDisplayName,
    likeCount: item.snippet.topLevelComment.snippet.likeCount
  }));
};
