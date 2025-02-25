interface NewsArticle {
  // ...existing types...
}

export const getNews = async (query?: string, country: string = 'us'): Promise<NewsResponse> => {
  const baseUrl = import.meta.env.VITE_NEWS_API_URL;
  const apiKey = import.meta.env.VITE_NEWS_API_KEY;
  
  const endpoint = query 
    ? `${baseUrl}/everything?q=${query}&sortBy=publishedAt&language=en&pageSize=4`
    : `${baseUrl}/top-headlines?country=${country}&pageSize=4`;

  const response = await fetch(`${endpoint}&apiKey=${apiKey}`);

  if (!response.ok) {
    throw new Error('Failed to fetch news');
  }

  return response.json();
};

export const analyzeNewsArticle = async (article: any): Promise<string> => {
  // Create a detailed analysis of the article
  return `📰 Detailed Analysis:

Title: ${article.title}
Published: ${new Date(article.publishedAt).toLocaleString()}
Source: ${article.source.name}

Key Points:
- ${article.description}
- Published by ${article.author || 'Unknown Author'}
- Full coverage available at ${article.url}

Summary:
${article.content || article.description}

Context & Analysis:
This article discusses ${article.title.toLowerCase()}, which is significant because it affects ${getTopicContext(article.title)}. 
The coverage appears to be ${article.source.name}'s perspective on the matter.

Related Topics:
${generateRelatedTopics(article.title)}`;
};

// Helper functions
const getTopicContext = (title: string): string => {
  // Simple context extraction - could be enhanced with AI
  if (title.toLowerCase().includes('tech')) return 'technology and innovation';
  if (title.toLowerCase().includes('market')) return 'the economy and markets';
  return 'current events and society';
};

const generateRelatedTopics = (title: string): string => {
  // Simple related topics - could be enhanced with AI
  const words = title.toLowerCase().split(' ');
  const topics = words
    .filter(w => w.length > 4)
    .map(w => `#${w}`)
    .slice(0, 3)
    .join(' ');
  return topics || '#news #current_events';
};