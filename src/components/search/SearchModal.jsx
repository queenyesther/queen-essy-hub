import { useState, useEffect } from 'react';
import { X, Search as SearchIcon } from 'lucide-react';
import { usePosts } from '../../context/PostsContext';
import { useNavigate } from 'react-router-dom';

function SearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const { posts } = usePosts();
  const navigate = useNavigate();

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!query.trim()) {
        setResults([]);
        return;
      }

      const searchResults = posts.filter(post => 
        post.content.toLowerCase().includes(query.toLowerCase()) ||
        post.authorName.toLowerCase().includes(query.toLowerCase())
      );

      setResults(searchResults);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, posts]);

  if (!isOpen) return null;

  const handlePostClick = () => {
    navigate('/blog');
    onClose();
    setQuery('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-[#2d2d2d] rounded-2xl border border-gray-800 shadow-2xl">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
        >
          <X size={24} />
        </button>

        {/* Search Input */}
        <div className="p-6 border-b border-gray-800">
          <div className="relative">
            <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search posts by content or author..."
              autoFocus
              className="w-full bg-[#1a1a1a] border border-gray-700 rounded-xl pl-12 pr-4 py-4 text-white text-lg placeholder-gray-500 focus:outline-none focus:border-pink-500 transition-colors"
            />
          </div>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto">
          {query && results.length === 0 && (
            <div className="p-8 text-center">
              <div className="text-gray-500 mb-2">
                <SearchIcon size={48} className="mx-auto opacity-30" />
              </div>
              <p className="text-gray-400">No posts found for "{query}"</p>
            </div>
          )}

          {results.length > 0 && (
            <div className="p-4 space-y-3">
              {results.map((post) => (
                <button
                  key={post.id}
                  onClick={handlePostClick}
                  className="w-full bg-[#1a1a1a] hover:bg-gray-800 rounded-xl p-4 transition-colors text-left group"
                >
                  <div className="flex gap-4">
                    <img 
                      src={post.image} 
                      alt="Post" 
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-white font-semibold group-hover:text-pink-400 transition-colors">
                          {post.authorName}
                        </span>
                        <span className="text-gray-500 text-sm">• {post.createdAt?.toDate ? post.createdAt.toDate().toLocaleDateString() : post.timestamp || ''}</span>
                      </div>
                      <p className="text-gray-300 text-sm line-clamp-2">
                        {post.content}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-gray-500 text-sm">
                        <span>❤️ {post.likes}</span>
                        <span>💬 {(post.comments || []).length}</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {!query && (
            <div className="p-8 text-center">
              <p className="text-gray-400">Start typing to search posts...</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default SearchModal;