import { motion } from 'framer-motion';
import { X, FileText, Image as ImageIcon, Loader2 } from 'lucide-react';

interface FilePreviewProps {
  file: {
    type: 'image' | 'file';
    url?: string;
    name: string;
    content?: string;
  } | null;
  isProcessing: boolean;
  onRemove?: () => void;
}

export const FilePreview = ({ file, isProcessing, onRemove }: FilePreviewProps) => {
  if (!file) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="absolute -top-20 left-0 right-0 bg-gray-800/90 backdrop-blur-sm rounded-lg border border-gray-700/50 p-3"
    >
      <div className="flex items-center gap-3">
        {file.type === 'image' && (
          <div className="relative w-12 h-12 rounded overflow-hidden bg-gray-700/50">
            <img
              src={file.url}
              alt={file.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        {file.type === 'file' && (
          <div className="w-12 h-12 rounded bg-gray-700/50 flex items-center justify-center">
            <FileText className="w-6 h-6 text-gray-400" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-300 truncate">{file.name}</p>
          <p className="text-xs text-gray-500">
            Ready to analyze - type a question or press Enter
          </p>
        </div>
        <button
          onClick={onRemove}
          className="p-1 hover:bg-gray-700/50 rounded-full"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>
      </div>
    </motion.div>
  );
};
