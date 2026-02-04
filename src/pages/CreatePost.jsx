import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Image as ImageIcon, Type, Eye, Send, AlertCircle, X, Loader } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { usePosts } from '../context/PostsContext';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';

function CreatePost() {
  const navigate = useNavigate();
  const { addPost } = usePosts();
  const { currentUser } = useAuth();
  const { openLoginModal } = useModal();
  
  // Use ref to track if we've already redirected
  const hasRedirected = useRef(false);
  
  // Initialize state with localStorage value directly
  const [selectedImage, setSelectedImage] = useState(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const savedImage = window.localStorage.getItem('selectedImage');
      if (savedImage) {
        window.localStorage.removeItem('selectedImage');
        return savedImage;
      }
    }
    return null;
  });
  
  const [postText, setPostText] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState('');


  // Auth check - only redirect once
  useEffect(() => {
    if (!currentUser && !hasRedirected.current) {
      hasRedirected.current = true;
      
      // Use setTimeout to avoid cascading renders
      const timer = setTimeout(() => {
        openLoginModal('Please login to create posts');
        navigate('/');
      }, 0);
      
      return () => clearTimeout(timer);
    }
  }, [currentUser, navigate, openLoginModal]);

  const wordCount = postText.trim().split(/\s+/).filter(word => word.length > 0).length;
  const isOverLimit = wordCount > 150;
  const canPublish = selectedImage && postText.trim().length > 0 && !isOverLimit && currentUser;


  const handlePublish = async () => {
    if (!canPublish || !currentUser) {
      return;
    }

    setPublishing(true);
    setPublishError('');

    const userName = currentUser.displayName || currentUser.email || 'User';
    const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    const newPost = {
      authorName: userName,
      authorAvatar: userInitials,
      authorUsername: currentUser.email ? `@${currentUser.email.split('@')[0]}` : '@user',
      authorId: currentUser.uid,
      image: selectedImage,
      content: postText,
      createdAt: new Date().toISOString()
    };

    try {
      await addPost(newPost);
      setPostText('');
      setSelectedImage(null);
      navigate('/blog');
    } catch {
      setPublishError('Failed to publish your post. Please try again.');
      setPublishing(false);
      return;
    }
    setPublishing(false);
  };

  // Don't render if not logged in
  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] py-8">
      <div className="max-w-5xl mx-auto px-4">
        
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              to="/gallery"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={24} />
            </Link>
            <div>
              <h1 className="text-4xl font-bold bg-linear-to-r from-pink-400 to-orange-400 bg-clip-text text-transparent">
                Create Your Post
              </h1>
              <p className="text-gray-400 text-sm">Share your story with the community</p>
            </div>
          </div>

          <button
            onClick={() => setShowPreview(!showPreview)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
              showPreview 
                ? 'bg-pink-500/20 border-pink-500 text-pink-400' 
                : 'border-gray-700 text-gray-400 hover:border-pink-500/50 hover:text-pink-400'
            }`}
          >
            <Eye size={18} />
            <span className="hidden sm:inline">Preview</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* LEFT SIDE - Create Form */}
          <div className="space-y-6">
            
            {/* Image Selection */}
            <div className="bg-[#2d2d2d] border border-gray-800 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-pink-500/20 flex items-center justify-center">
                  <ImageIcon className="text-pink-400" size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Select Image</h2>
                  <p className="text-gray-400 text-sm">Choose an image for your post</p>
                </div>
              </div>

              {selectedImage ? (
                <div className="space-y-4">
                  <div className="relative aspect-video rounded-xl overflow-hidden group">
                    <img
                      src={selectedImage}
                      alt="Selected"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Link
                        to="/gallery"
                        className="bg-white text-black px-4 py-2 rounded-lg font-medium"
                      >
                        Change Image
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <ImageIcon size={48} className="mx-auto text-gray-600 mb-4" />
                  <p className="text-gray-400 mb-4">No image selected yet</p>
                  <Link
                    to="/gallery"
                    className="inline-block bg-linear-to-r from-pink-500 to-orange-500 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg hover:shadow-pink-500/50 transition-all"
                  >
                    Choose from Gallery
                  </Link>
                </div>
              )}
            </div>

            {/* Text Input */}
            <div className="bg-[#2d2d2d] border border-gray-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                    <Type className="text-orange-400" size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">Write Your Story</h2>
                    <p className="text-gray-400 text-sm">Share your thoughts and experiences</p>
                  </div>
                </div>
              </div>

              <textarea
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
                placeholder="What's on your mind? Share your story, thoughts, or experiences..."
                className="w-full bg-[#1a1a1a] border border-gray-700 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-pink-500 transition-colors resize-none"
                rows="8"
              />

              <div className="mt-4 flex items-center justify-between">
                <div className={`flex items-center gap-2 ${isOverLimit ? 'text-red-400' : 'text-gray-400'}`}>
                  {isOverLimit && <AlertCircle size={18} />}
                  <span className="text-sm font-medium">
                    {wordCount} / 150 words
                  </span>
                </div>
                {isOverLimit && (
                  <span className="text-red-400 text-sm">Please reduce your text</span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Link
                to="/blog"
                className="flex-1 bg-gray-800 text-white py-3 rounded-lg font-medium hover:bg-gray-700 transition-all text-center"
              >
                Cancel
              </Link>
              <button
                onClick={() => setShowPublishModal(true)}
                disabled={!canPublish}
                className={`flex-1 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all ${
                  canPublish
                    ? 'bg-linear-to-r from-pink-500 to-orange-500 text-white hover:shadow-lg hover:shadow-pink-500/50 hover:scale-105'
                    : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Send size={18} />
                Publish Post
              </button>
            </div>
          </div>

          {/* RIGHT SIDE - Preview */}
          <div className={`${showPreview ? 'block' : 'hidden lg:block'}`}>
            <div className="sticky top-8">
              <div className="bg-[#2d2d2d] border border-gray-800 rounded-2xl p-6">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Eye size={20} className="text-pink-400" />
                  Preview
                </h2>

                {/* Preview Post */}
                <div className="bg-[#1a1a1a] rounded-xl overflow-hidden border border-gray-700">
                  <div className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-linear-to-br from-pink-500 to-orange-500 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {currentUser?.displayName?.[0]?.toUpperCase() || currentUser?.email?.[0]?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">
                        {currentUser?.displayName || currentUser?.email || 'Your Name'}
                      </h3>
                      <p className="text-gray-400 text-xs">Just now</p>
                    </div>
                  </div>

                  {selectedImage ? (
                    <img 
                      src={selectedImage} 
                      alt="Preview" 
                      className="w-full aspect-video object-cover"
                    />
                  ) : (
                    <div className="w-full aspect-video bg-gray-800 flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <ImageIcon size={48} className="mx-auto mb-2" />
                        <p>No image selected</p>
                      </div>
                    </div>
                  )}

                  <div className="p-4">
                    {postText.trim() ? (
                      <p className="text-gray-300 leading-relaxed">
                        <span className="font-semibold text-white">
                          {currentUser?.displayName || currentUser?.email || 'Your Name'}
                        </span> {postText}
                      </p>
                    ) : (
                      <p className="text-gray-500 italic">Your text will appear here...</p>
                    )}
                  </div>

                  <div className="px-4 pb-4 flex items-center gap-4 text-gray-500">
                    <div className="flex items-center gap-2">
                      <span>❤️</span>
                      <span className="text-sm">0</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>💬</span>
                      <span className="text-sm">0</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 bg-pink-500/10 border border-pink-500/20 rounded-lg p-4">
                  <h3 className="text-pink-400 font-semibold mb-2 text-sm">💡 Tips for Great Posts</h3>
                  <ul className="text-gray-400 text-sm space-y-1">
                    <li>• Be authentic and share your genuine thoughts</li>
                    <li>• Use descriptive language to paint a picture</li>
                    <li>• Keep it concise - quality over quantity</li>
                    <li>• Check your spelling before publishing</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Confirmation Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative bg-[#2d2d2d] rounded-2xl border border-gray-800 p-6 max-w-md w-full">
            <button
              onClick={() => setShowPublishModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>

            <div className="text-center">
              {publishing ? (
                <>
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-pink-500/20 flex items-center justify-center">
                    <Loader size={32} className="text-pink-400 animate-spin" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Publishing...</h3>
                  <p className="text-gray-400 mb-6">
                    Your post is being shared with the community.
                  </p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-pink-500/20 flex items-center justify-center">
                    <Send size={32} className="text-pink-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Publish Post?</h3>
                  {publishError && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
                      <p className="text-red-400 text-sm">{publishError}</p>
                    </div>
                  )}
                  <p className="text-gray-400 mb-6">
                    Are you sure you want to publish this post to the blog? Everyone will be able to see it.
                  </p>

                  <div className="flex gap-4">
                    <button
                      onClick={() => setShowPublishModal(false)}
                      className="flex-1 bg-gray-800 text-white py-3 rounded-lg font-medium hover:bg-gray-700 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handlePublish}
                      className="flex-1 bg-linear-to-r from-pink-500 to-orange-500 text-white py-3 rounded-lg font-medium hover:shadow-lg hover:shadow-pink-500/50 transition-all"
                    >
                      Yes, Publish
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreatePost;