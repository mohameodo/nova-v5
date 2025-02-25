import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ExternalLink, Link as LinkIcon } from 'lucide-react';

interface SearchResultsProps {
  results: Array<{
    title: string;
    link: string;
    snippet: string;
    image?: string;
    type: 'text' | 'image' | 'video';
  }>;
}

export const SearchResults = ({ results }: SearchResultsProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 4;
  
  const types = {
    image: results.filter(r => r.type === 'image'),
    video: results.filter(r => r.type === 'video'),
    text: results.filter(r => r.type === 'text')
  };

  return (
    <motion.div 
      className="space-y-6 w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Images Section */}
      {types.image.length > 0 && (
        <motion.div layout className="space-y-2">
          <motion.h3 className="text-sm font-medium text-gray-400">Images</motion.h3>
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div 
                className="grid grid-cols-2 sm:grid-cols-4 gap-2"
                key={currentPage}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
              >
                {types.image
                  .slice(currentPage * pageSize, (currentPage + 1) * pageSize)
                  .map((result, i) => (
                    <ImageCard key={result.link} result={result} index={i} />
                  ))}
              </motion.div>
            </AnimatePresence>
            
            {types.image.length > pageSize && (
              <NavigationButtons
                currentPage={currentPage}
                totalPages={Math.ceil(types.image.length / pageSize)}
                onPageChange={setCurrentPage}
              />
            )}
          </div>
        </motion.div>
      )}

      {/* Text Results */}
      {types.text.map((result, i) => (
        <TextResult key={result.link} result={result} index={i} />
      ))}

      {/* Video Results */}
      {types.video.map((result, i) => (
        <VideoResult key={result.link} result={result} index={i} />
      ))}
    </motion.div>
  );
};

const ImageCard = ({ result, index }: { result: SearchResult; index: number }) => (
  <motion.a
    href={result.link}
    target="_blank"
    rel="noopener noreferrer"
    className="relative aspect-square rounded-lg overflow-hidden group"
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: index * 0.1 }}
    whileHover={{ scale: 1.05 }}
  >
    <motion.img
      src={result.image}
      alt={result.title}
      className="w-full h-full object-cover"
      loading="lazy"
    />
    <motion.div 
      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
      initial={false}
    >
      <ExternalLink className="w-5 h-5 text-white" />
    </motion.div>
  </motion.a>
);

const TextResult = ({ result, index }: { result: SearchResult; index: number }) => (
  <motion.a
    href={result.link}
    target="_blank"
    rel="noopener noreferrer"
    className="block p-4 rounded-lg hover:bg-gray-800/50 transition-colors"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
  >
    <div className="flex items-start gap-3">
      <LinkIcon className="w-4 h-4 text-blue-400 mt-1 flex-shrink-0" />
      <div>
        <h3 className="text-blue-400 text-base font-medium mb-1">{result.title}</h3>
        <p className="text-gray-400 text-sm leading-relaxed">{result.snippet}</p>
      </div>
    </div>
  </motion.a>
);

const NavigationButtons = ({ currentPage, totalPages, onPageChange }) => (
  <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between px-2 pointer-events-none">
    <motion.button
      onClick={() => onPageChange(p => Math.max(0, p - 1))}
      className="p-2 rounded-full bg-black/70 text-white pointer-events-auto"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      disabled={currentPage === 0}
    >
      <ChevronLeft className="w-4 h-4" />
    </motion.button>
    <motion.button
      onClick={() => onPageChange(p => Math.min(totalPages - 1, p + 1))}
      className="p-2 rounded-full bg-black/70 text-white pointer-events-auto"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      disabled={currentPage === totalPages - 1}
    >
      <ChevronRight className="w-4 h-4" />
    </motion.button>
  </div>
);
