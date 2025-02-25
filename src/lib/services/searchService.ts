export interface SearchResult {
  title: string;
  link: string;
  snippet: string;
  image?: string;
  type: 'text' | 'image' | 'video';
}

export const searchWeb = async (query: string, type: 'all' | 'image' | 'video' = 'all') => {
  try {
    if (!query.trim()) {
      throw new Error('Please enter a search query');
    }

    // Use alternative proxy if allorigins fails
    const corsProxies = [
      'https://api.allorigins.win/get?url=',
      'https://cors-anywhere.herokuapp.com/',
      'https://proxy.cors.sh/'
    ];

    const params = new URLSearchParams({
      q: query.trim(),
      format: 'json',
      no_html: '1',
      no_redirect: '1',
      kl: 'wt-wt', // Worldwide results
      t: 'novai'
    }).toString();

    let data;
    let error;

    // Try each proxy until one works
    for (const proxy of corsProxies) {
      try {
        const response = await fetch(`${proxy}https://api.duckduckgo.com/?${params}`);
        if (!response.ok) continue;
        
        const json = await response.json();
        data = json.contents ? JSON.parse(json.contents) : json;
        break;
      } catch (e) {
        error = e;
        continue;
      }
    }

    if (!data) {
      throw error || new Error('Failed to fetch search results');
    }

    let results: SearchResult[] = [];

    // Extract all possible results
    results = [
      // Abstract (main result)
      ...(data.Abstract ? [{
        title: data.Heading || 'Main Result',
        link: data.AbstractURL || '',
        snippet: data.Abstract,
        type: 'text'
      }] : []),

      // Related Topics
      ...(data.RelatedTopics || []).map(topic => ({
        title: topic.Text?.split(' - ')[0] || topic.FirstURL || '',
        link: topic.FirstURL || '',
        snippet: topic.Text || '',
        image: topic.Icon?.URL || null,
        type: 'text'
      })),

      // Results
      ...(data.Results || []).map(result => ({
        title: result.Text || result.FirstURL || '',
        link: result.FirstURL || '',
        snippet: result.Text || '',
        image: result.Icon?.URL || null,
        type: result.FirstURL?.includes('youtube.com') ? 'video' : 'text'
      })),

      // Image results
      ...(data.Images || []).map(image => ({
        title: image.title || '',
        link: image.url || image.image || '',
        snippet: image.title || '',
        image: image.image || image.url || '',
        type: 'image'
      }))
    ];

    // Filter by type if specified
    if (type !== 'all') {
      results = results.filter(r => r.type === type);
    }

    // Filter out invalid results and duplicates
    results = results
      .filter(result => result.link && result.title)
      .filter((result, index, self) => 
        index === self.findIndex(r => r.link === result.link)
      );

    if (results.length === 0) {
      throw new Error(`No results found for "${query}". Try different keywords.`);
    }

    return results;

  } catch (error: any) {
    console.error('Search error:', error);
    throw new Error(
      error.message || 'Search failed. Please try again with different keywords.'
    );
  }
};
