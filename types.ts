
export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channelId: string;
  channelTitle: string;
  publishedAt: string;
  statistics?: {
    viewCount: number;
    likeCount: number;
    commentCount: number;
  };
  channelStats?: {
    subscriberCount: number;
  };
  performanceRatio?: number;
}

export interface AnalysisResult {
  summary: string;
  commonQuestions: string[];
  audienceSentiment: string;
  topKeywords: string[]; // Added: 5 representative keywords
  suggestedTopics: {
    title: string;
    reasoning: string;
    hookIdea: string;
  }[];
}

export interface ScriptOutline {
  title: string;
  sections: {
    heading: string;
    content: string;
  }[];
}

export interface CommentData {
  text: string;
  author: string;
  likeCount: number;
}
