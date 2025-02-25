import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star, Calendar, Play, Tv } from 'lucide-react';
import { Movie } from '@/lib/services/tmdbService';
import { Link } from 'react-router-dom';

interface MovieCarouselProps {
  movies: Movie[];
  onMovieClick: (movie: Movie) => void;
}

export const MovieCarousel = ({ movies, onMovieClick }: MovieCarouselProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Update items per page based on screen size
  const getItemsPerView = () => {
    const width = window.innerWidth;
    if (width < 640) return 2.5; // mobile - show partial card
    if (width < 1024) return 3.5; // tablet - show partial card
    return 5; // desktop
  };

  const [itemsPerPage, setItemsPerPage] = useState(getItemsPerView());

  useEffect(() => {
    const updateLayout = () => setItemsPerPage(getItemsPerView());
    window.addEventListener('resize', updateLayout);
    return () => window.removeEventListener('resize', updateLayout);
  }, []);

  const movies_array = movies.slice(0, 10);
  const totalPages = Math.max(0, Math.ceil(movies_array.length / itemsPerPage) - 1);

  return (
    <div className="relative -mx-4 sm:-mx-6 md:-mx-8">
      <div className="relative overflow-hidden" ref={containerRef}>
        <motion.div
          className="flex gap-2 px-4 sm:px-6 md:px-8"
          animate={{ x: `calc(${-currentPage * 100}%)` }}
          transition={{ type: "tween", ease: "easeInOut", duration: 0.5 }}
        >
          {movies_array.map((movie) => (
            <motion.div
              key={movie.id}
              className="flex-none w-[48%] sm:w-[32%] md:w-[20%]"
            >
              <MovieCard movie={movie} onClick={() => onMovieClick(movie)} />
            </motion.div>
          ))}
        </motion.div>

        {totalPages > 0 && (
          <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between pointer-events-none">
            <motion.button
              className="pointer-events-auto p-2 rounded-full bg-black/50 text-white backdrop-blur-sm ml-2"
              onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
              initial={{ opacity: 0 }}
              animate={{ opacity: currentPage > 0 ? 1 : 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ChevronLeft className="w-4 h-4" />
            </motion.button>
            <motion.button
              className="pointer-events-auto p-2 rounded-full bg-black/50 text-white backdrop-blur-sm mr-2"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              initial={{ opacity: 0 }}
              animate={{ opacity: currentPage < totalPages ? 1 : 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
};

const MovieCard = ({ movie, onClick }: { movie: Movie; onClick: () => void }) => (
  <div className="group relative">
    <motion.div
      className="relative aspect-[2/3] rounded-lg overflow-hidden cursor-pointer bg-gray-900"
      whileHover={{ scale: 1.05 }}
    >
      <img
        src={movie.poster_path}
        alt={movie.title}
        className="w-full h-full object-cover"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
        <div className="absolute bottom-0 left-0 right-0 p-3 space-y-2">
          <p className="text-white text-xs sm:text-sm font-medium line-clamp-2">
            {movie.title}
          </p>
          <div className="flex items-center gap-2 text-xs text-white/90">
            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
            <span>{movie.vote_average.toFixed(1)}</span>
            <span className="text-white/60">
              ({new Date(movie.release_date).getFullYear()})
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={onClick}
              className="flex-1 flex items-center justify-center gap-1 px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-xs font-medium text-white"
            >
              <Play className="w-3 h-3" /> Details
            </button>
            <Link
              to={`https://vlop.fun/#/media/tmdb-movie-${movie.id}`}
              className="flex items-center justify-center px-2 py-1 bg-blue-500/80 hover:bg-blue-500 rounded text-xs font-medium text-white"
            >
              Watch
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  </div>
);
