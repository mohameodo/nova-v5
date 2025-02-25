export interface Movie {
  id: number;
  title: string;
  poster_path: string;
  overview: string;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
}

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = import.meta.env.VITE_TMDB_API_URL || 'https://api.themoviedb.org/3';
const IMAGE_BASE = import.meta.env.VITE_TMDB_IMAGE_URL || 'https://image.tmdb.org/t/p/original';

const fetchTMDB = async (endpoint: string) => {
  const url = `${BASE_URL}${endpoint}`;
  console.log('Fetching from:', url); // Debug log

  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('TMDB Error Response:', errorData);
      throw new Error(errorData.status_message || 'Failed to fetch from TMDB');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('TMDB API Error:', error);
    throw error;
  }
};

export const fetchMovieRecommendations = async (query: string) => {
  try {
    console.log('Searching for movies:', query); // Debug log
    const data = await fetchTMDB(
      `/search/movie?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1&region=US`
    );

    if (!data.results?.length) {
      throw new Error('No movies found for your search');
    }

    return data.results
      .filter(movie => movie.poster_path && movie.vote_average > 0)
      .map(movie => ({
        id: movie.id,
        title: movie.title,
        poster_path: `${IMAGE_BASE}${movie.poster_path}`, // Use full image URL
        overview: movie.overview,
        release_date: movie.release_date,
        vote_average: movie.vote_average,
        genre_ids: movie.genre_ids
      }))
      .slice(0, 12); // Limit to 12 movies (3 rows of 4)
  } catch (error: any) {
    console.error('Movie search error:', error);
    throw new Error(error.message || 'Failed to fetch movie recommendations');
  }
};

export const getMovieDetails = async (movieId: number) => {
  try {
    const data = await fetchTMDB(
      `/movie/${movieId}?append_to_response=credits,similar,videos`
    );

    return {
      ...data,
      poster_path: data.poster_path ? `${IMAGE_BASE}${data.poster_path}` : null,
      backdrop_path: data.backdrop_path ? `${IMAGE_BASE}${data.backdrop_path}` : null
    };
  } catch (error) {
    console.error('Movie details error:', error);
    throw new Error('Failed to fetch movie details');
  }
};

// Helper function is no longer needed as we're using full URLs
export const getPosterUrl = (path: string) => path;
