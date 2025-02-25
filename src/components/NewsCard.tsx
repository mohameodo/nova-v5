import { motion } from 'framer-motion';
import { ExternalLink, Calendar, User, Brain } from 'lucide-react';

interface NewsCardProps {
  article: {
    title: string;
    description: string;
    url: string;
    urlToImage: string;
    publishedAt: string;
    source: { name: string };
    author: string;
  };
  onAnalyze: (article: any) => void;
}

export const NewsCard = ({ article, onAnalyze }: NewsCardProps) => {
  const date = new Date(article.publishedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800/50 rounded-xl overflow-hidden border border-gray-700/50 hover:border-gray-600/50 transition-colors"
    >
      <div className="aspect-video relative overflow-hidden bg-gray-900/50">
        {article.urlToImage ? (
          <img
            src={article.urlToImage}
            alt={article.title}
            className="w-full h-full object-cover transition-transform hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-800/50">
            <span className="text-gray-400">No image available</span>
          </div>
        )}
      </div>
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <Calendar className="w-3 h-3" />
            <span>{date}</span>
          </div>
          <span className="text-gray-500">{article.source.name}</span>
        </div>
        <h3 className="font-medium text-gray-200 line-clamp-2">{article.title}</h3>
        <p className="text-sm text-gray-400 line-clamp-2">{article.description}</p>
        <div className="pt-2 flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <User className="w-3 h-3" />
            <span>{article.author || 'Unknown'}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onAnalyze(article)}
              className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300"
            >
              Analyze <Brain className="w-3 h-3" />
            </button>
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
            >
              Read more <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
