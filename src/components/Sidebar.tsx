import { useState, useEffect } from "react";
import { Search, ArrowLeft, MessageSquarePlus, Menu, Trash2, Square, CheckSquare, MoreVertical, X, MessageCirclePlus } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Input } from './ui/input';
import { useAuth } from '@/hooks/useAuth';
import { getUserChats, searchChats } from '@/lib/db';
import { formatDistanceToNow } from 'date-fns';
import { doc, deleteDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onNewChat: () => void;
  currentChatId: string | null;
  onChatSelect: (chatId: string) => void;
}

const Sidebar = ({ isOpen, onToggle, onNewChat, currentChatId, onChatSelect }: SidebarProps) => {
  const { user } = useAuth();
  const [chats, setChats] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedChats, setSelectedChats] = useState<string[]>([]);
  const [showActions, setShowActions] = useState(false);
  const [showSelectMenu, setShowSelectMenu] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (user) {
      loadChats();
    }
  }, [user]);

  const loadChats = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const userChats = await getUserChats(user.uid);
      setChats(userChats);
    } catch (error) {
      console.error('Error loading chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    setIsSearching(true);

    try {
      if (!term.trim()) {
        await loadChats();
        setSearchResults([]);
        return;
      }

      if (user) {
        const results = await searchChats(user.uid, term);
        setSearchResults(results);
        setChats(results);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm) {
        handleSearch(searchTerm);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleDelete = async (chatId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!user || !window.confirm('Are you sure you want to delete this chat?')) return;

    try {
      await deleteDoc(doc(db, `users/${user.uid}/chats/${chatId}`));
      if (chatId === currentChatId) {
        onNewChat();
      }
      loadChats();
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  };

  const handleDeleteSelected = async () => {
    if (!user || selectedChats.length === 0) return;
    if (!confirm(`Delete ${selectedChats.length} selected chat${selectedChats.length > 1 ? 's' : ''}?`)) return;

    try {
      await Promise.all(
        selectedChats.map(chatId => deleteDoc(doc(db, `users/${user.uid}/chats/${chatId}`)))
      );
      if (selectedChats.includes(currentChatId || '')) {
        onNewChat();
      }
      loadChats();
      setSelectedChats([]);
      setIsSelectionMode(false);
    } catch (error) {
      console.error('Error deleting chats:', error);
    }
  };

  const toggleChatSelection = (chatId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedChats(prev => 
      prev.includes(chatId) ? prev.filter(id => id !== chatId) : [...prev, chatId]
    );
  };

  const handleSelectAll = () => {
    const allChatIds = chats.map(chat => chat.id);
    setSelectedChats(allChatIds);
  };

  const toggleShowActions = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowActions(!showActions);
  };

  const handleNewChat = () => {
    onNewChat();
    onToggle(); // Close sidebar when creating new chat
  };

  return (
    <aside className={cn(
      "fixed inset-0 bg-[#1d1e20] z-40 transition-transform duration-300",
      "lg:left-0 lg:right-auto lg:w-64 w-full", // Full screen on mobile
      isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
    )}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <div className="flex items-center gap-2 flex-1">
            <button 
              onClick={onToggle}
              className="lg:hidden p-2 hover:bg-gray-800/50 rounded-md"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="relative flex-1">
              <Search className={cn(
                "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-opacity",
                searchTerm ? "opacity-0" : "text-gray-400"
              )} />
              <input
                type="text"
                placeholder="Search chats..."
                className="w-full pl-9 pr-3 py-2 bg-gray-700/25 border border-gray-700/50 rounded-md text-sm 
                         focus:outline-none focus:border-gray-600 focus:ring-1 focus:ring-gray-600/50
                         placeholder-gray-400 text-gray-200 transition-colors"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    loadChats();
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-800/50 rounded-full"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2 hover:bg-gray-800 rounded-md">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-[#1d1e20] border-gray-800">
                {!isSelectionMode ? (
                  <DropdownMenuItem onClick={() => setIsSelectionMode(true)}>
                    Select Chats
                  </DropdownMenuItem>
                ) : (
                  <>
                    <DropdownMenuItem onClick={handleSelectAll}>
                      Select All
                    </DropdownMenuItem>
                    {selectedChats.length > 0 && (
                      <DropdownMenuItem onClick={handleDeleteSelected} className="text-red-400">
                        Delete Selected ({selectedChats.length})
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => setIsSelectionMode(false)}>
                      Cancel Selection
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Selection Mode Header */}
        {isSelectionMode && (
          <div className="flex items-center justify-between px-4 py-2 bg-gray-800/30 border-b border-gray-800">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsSelectionMode(false)}
                className="p-1 hover:bg-gray-800 rounded-md"
              >
                <X className="h-4 w-4" />
              </button>
              <span className="text-sm text-gray-300">
                {selectedChats.length} selected
              </span>
            </div>
            {selectedChats.length > 0 && (
              <button
                onClick={handleDeleteSelected}
                className="text-red-400 hover:text-red-300 text-sm flex items-center gap-1"
              >
                <Trash2 className="h-4 w-4" /> Delete
              </button>
            )}
          </div>
        )}

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {isSearching ? (
            <div className="flex items-center justify-center h-32">
              <span className="text-sm text-gray-400">Searching...</span>
            </div>
          ) : searchTerm && searchResults.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 p-4">
              <p className="text-sm text-gray-400">No chats found matching "{searchTerm}"</p>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center h-32">
              <span className="text-sm text-gray-400">Loading chats...</span>
            </div>
          ) : chats.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 p-4 text-center">
              <MessageCirclePlus className="w-12 h-12 text-gray-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-300">No chats yet</h3>
              <p className="text-sm text-gray-500 mt-2">
                Start a new conversation to begin chatting
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-800">
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  className={cn(
                    "flex items-center px-4 py-3 cursor-pointer group",
                    chat.id === currentChatId && "bg-gray-800/50 border-l-2 border-blue-500",
                    "hover:bg-gray-800/20"
                  )}
                  onClick={() => !isSelectionMode && onChatSelect(chat.id)}
                >
                  {isSelectionMode ? (
                    <div 
                      className="mr-3"
                      onClick={(e) => toggleChatSelection(chat.id, e)}
                    >
                      <CheckSquare 
                        className={cn(
                          "w-5 h-5",
                          selectedChats.includes(chat.id) ? "text-blue-400" : "text-gray-400"
                        )}
                      />
                    </div>
                  ) : null}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-300 truncate">{chat.lastMessage}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDistanceToNow(chat.createdAt.toDate(), { addSuffix: true })}
                    </p>
                  </div>
                  {!isSelectionMode && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-800 rounded-md"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-[#1d1e20] border-gray-800">
                        <DropdownMenuItem
                          className="text-red-400"
                          onClick={(e) => handleDelete(chat.id, e)}
                        >
                          Delete Chat
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selection Mode Actions */}
        {isSelectionMode && selectedChats.length > 0 && (
          <div className="p-4 border-t border-gray-800 bg-red-500/10">
            <button
              onClick={handleDeleteSelected}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-md text-red-400 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete Selected ({selectedChats.length})
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-gray-800 space-y-2">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <MessageCirclePlus className="w-5 h-5" />
            <span>Create New Chat</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;