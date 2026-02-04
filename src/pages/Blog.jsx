import { useState, useEffect } from 'react';
import { Heart, MessageSquare, Send, Trash2, X, Loader, Reply, CornerDownRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePosts } from '../context/PostsContext';
import { useAuth } from '../context/AuthContext';
import { getUserProfile } from '../services/firestore';

// Helper function for time ago
function getTimeAgo(timestamp) {
  if (!timestamp) return 'Just now';

  // Handle Firestore Timestamp objects
  const postDate = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
  if (isNaN(postDate.getTime())) return timestamp; // fallback for plain strings like "2 hours ago"

  const now = new Date();
  const seconds = Math.floor((now - postDate) / 1000);
  
  if (seconds < 60) return `${seconds} sec ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  const months = Math.floor(days / 30);
  return `${months} month${months > 1 ? 's' : ''} ago`;
}

function Blog() {
  const { posts, loading, toggleLike, toggleComments, addComment, deletePost, toggleCommentLike, addReply, toggleReplyLike } = usePosts();
  const { currentUser } = useAuth();
  const [commentText, setCommentText] = useState({});
  const [replyText, setReplyText] = useState({});
  const [replyingTo, setReplyingTo] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [profilePics, setProfilePics] = useState({});

  // Fetch profile pictures for all unique author IDs
  useEffect(() => {
    const authorIds = new Set();
    if (currentUser?.uid) authorIds.add(currentUser.uid);
    posts.forEach((post) => {
      if (post.authorId) authorIds.add(post.authorId);
      (post.comments || []).forEach((c) => {
        if (c.authorId) authorIds.add(c.authorId);
      });
    });

    // Only fetch IDs we don't already have cached
    const idsToFetch = [...authorIds].filter((id) => !(id in profilePics));
    if (idsToFetch.length === 0) return;

    let cancelled = false;
    Promise.all(
      idsToFetch.map((uid) => getUserProfile(uid).then((p) => [uid, p?.photoURL || null]))
    ).then((results) => {
      if (cancelled) return;
      const newPics = {};
      results.forEach(([uid, url]) => { newPics[uid] = url; });
      setProfilePics((prev) => ({ ...prev, ...newPics }));
    });
    return () => { cancelled = true; };
  }, [posts, currentUser]);

  const handleAddComment = (postId) => {
    const text = commentText[postId];
    if (!text || text.trim() === '') return;

    const authorName = currentUser?.displayName || currentUser?.email || 'Anonymous';
    addComment(postId, text, authorName);
    setCommentText({ ...commentText, [postId]: '' });
  };

  const handleAddReply = (postId, commentId) => {
    const text = replyText[commentId];
    if (!text || text.trim() === '') return;

    const authorName = currentUser?.displayName || currentUser?.email || 'Anonymous';
    addReply(postId, commentId, text, authorName);
    setReplyText({ ...replyText, [commentId]: '' });
    setReplyingTo(null);
  };

  const handleDeleteClick = (postId) => {
    setPostToDelete(postId);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (postToDelete) {
      deletePost(postToDelete);
      setDeleteModalOpen(false);
      setPostToDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] py-8">
      <div className="max-w-3xl mx-auto px-4">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold bg-linear-to-r from-pink-400 to-orange-400 bg-clip-text text-transparent mb-2">
            Community Feed
          </h1>
          <p className="text-gray-400 text-lg">See what the community is sharing</p>
        </div>

        {/* Create Post Prompt */}
        <Link
          to="/create"
          className="block bg-[#2d2d2d] border border-gray-800 rounded-2xl p-6 mb-8 hover:border-pink-500/50 transition-all duration-300 group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-linear-to-br from-pink-500 to-orange-500 flex items-center justify-center overflow-hidden">
              {currentUser?.uid && profilePics[currentUser.uid] ? (
                <img src={profilePics[currentUser.uid]} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-white font-bold text-lg">
                  {currentUser?.displayName?.[0]?.toUpperCase() || currentUser?.email?.[0]?.toUpperCase() || 'U'}
                </span>
              )}
            </div>
            <div className="flex-1">
              <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
                Share your story with the community...
              </p>
            </div>
            <button className="bg-linear-to-r from-pink-500 to-orange-500 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg hover:shadow-pink-500/50 transition-all">
              Create Post
            </button>
          </div>
        </Link>

        {/* Posts */}
        <div className="space-y-6">
          {posts.map((post) => (
            <div key={post.id} className="bg-[#2d2d2d] rounded-2xl overflow-hidden border border-gray-800">
              
              {/* Post Header */}
              <div className="p-4 flex items-center justify-between">
                <Link 
                  to={`/profile/${post.authorUsername?.replace('@', '') || post.authorName}`}
                  className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                >
                  <div className="w-12 h-12 rounded-full bg-linear-to-br from-pink-500 to-orange-500 flex items-center justify-center overflow-hidden">
                    {post.authorId && profilePics[post.authorId] ? (
                      <img src={profilePics[post.authorId]} alt={post.authorName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white font-bold text-sm">{post.authorAvatar}</span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-white font-semibold hover:text-pink-400 transition-colors">
                      {post.authorName}
                    </h3>
                    <p className="text-gray-400 text-sm">{getTimeAgo(post.createdAt || post.timestamp)}</p>
                  </div>
                </Link>

                {/* Delete button - only for own posts */}
                {currentUser && post.authorId === currentUser.uid && (
                  <button
                    onClick={() => handleDeleteClick(post.id)}
                    className="text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                )}
              </div>

              {/* Image */}
              <img src={post.image} alt="Post" className="w-full h-96 object-cover" />

              {/* Actions */}
              <div className="p-4">
                <div className="flex items-center gap-4 mb-4">
                  <button 
                    onClick={() => toggleLike(post.id)}
                    className={`flex items-center gap-2 ${post.liked ? 'text-pink-500' : 'text-gray-400'}`}
                  >
                    <Heart size={24} fill={post.liked ? 'currentColor' : 'none'} />
                    <span className="font-semibold">{post.likes}</span>
                  </button>
                  
                  <button 
                    onClick={() => toggleComments(post.id)}
                    className="flex items-center gap-2 text-gray-400 hover:text-blue-400"
                  >
                    <MessageSquare size={24} />
                    <span className="font-semibold">{(post.comments || []).length}</span>
                  </button>
                </div>

                {/* Content */}
                <p className="text-gray-300 mb-4">
                  <span className="font-semibold text-white">{post.authorName}</span> {post.content}
                </p>

                {/* Comments */}
                {post.showComments && (
                  <div className="pt-4 border-t border-gray-700 space-y-3">
                    {(post.comments || []).map((comment) => (
                      <div key={comment.id} className="space-y-2">
                        {/* Comment */}
                        <div className="flex gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center shrink-0 overflow-hidden">
                            {comment.authorId && profilePics[comment.authorId] ? (
                              <img src={profilePics[comment.authorId]} alt={comment.author} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-white text-xs font-bold">{comment.author[0]}</span>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="bg-[#1a1a1a] rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-white font-semibold text-sm">{comment.author}</span>
                                <span className="text-gray-500 text-xs">{getTimeAgo(comment.time)}</span>
                              </div>
                              <p className="text-gray-300 text-sm">{comment.text}</p>
                            </div>
                            {/* Comment actions */}
                            <div className="flex items-center gap-4 mt-1 ml-2">
                              <button
                                onClick={() => toggleCommentLike(post.id, comment.id)}
                                className={`flex items-center gap-1 text-xs transition-colors ${
                                  (comment.likedBy || []).includes(currentUser?.uid)
                                    ? 'text-pink-400'
                                    : 'text-gray-500 hover:text-pink-400'
                                }`}
                              >
                                <Heart size={14} fill={(comment.likedBy || []).includes(currentUser?.uid) ? 'currentColor' : 'none'} />
                                <span>{comment.likes || 0}</span>
                              </button>
                              <button
                                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                                className={`flex items-center gap-1 text-xs transition-colors ${
                                  replyingTo === comment.id
                                    ? 'text-blue-400'
                                    : 'text-gray-500 hover:text-blue-400'
                                }`}
                              >
                                <Reply size={14} />
                                <span>Reply</span>
                              </button>
                              {(comment.replies || []).length > 0 && (
                                <span className="text-gray-500 text-xs">
                                  {(comment.replies || []).length} {(comment.replies || []).length === 1 ? 'reply' : 'replies'}
                                </span>
                              )}
                            </div>

                            {/* Replies */}
                            {(comment.replies || []).length > 0 && (
                              <div className="mt-2 ml-2 space-y-2">
                                {(comment.replies || []).map((reply) => (
                                  <div key={reply.id} className="flex gap-2">
                                    <CornerDownRight size={14} className="text-gray-600 mt-2 shrink-0" />
                                    <div className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center shrink-0 overflow-hidden">
                                      {reply.authorId && profilePics[reply.authorId] ? (
                                        <img src={profilePics[reply.authorId]} alt={reply.author} className="w-full h-full object-cover" />
                                      ) : (
                                        <span className="text-white text-xs font-bold">{reply.author[0]}</span>
                                      )}
                                    </div>
                                    <div className="flex-1">
                                      <div className="bg-[#232323] rounded-lg p-2.5">
                                        <div className="flex items-center gap-2 mb-1">
                                          <span className="text-white font-semibold text-xs">{reply.author}</span>
                                          <span className="text-gray-500 text-xs">{getTimeAgo(reply.time)}</span>
                                        </div>
                                        <p className="text-gray-300 text-xs">{reply.text}</p>
                                      </div>
                                      <button
                                        onClick={() => toggleReplyLike(post.id, comment.id, reply.id)}
                                        className={`flex items-center gap-1 text-xs mt-1 ml-2 transition-colors ${
                                          (reply.likedBy || []).includes(currentUser?.uid)
                                            ? 'text-pink-400'
                                            : 'text-gray-500 hover:text-pink-400'
                                        }`}
                                      >
                                        <Heart size={12} fill={(reply.likedBy || []).includes(currentUser?.uid) ? 'currentColor' : 'none'} />
                                        <span>{reply.likes || 0}</span>
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Reply Input */}
                            {replyingTo === comment.id && (
                              <div className="flex gap-2 mt-2 ml-2">
                                <input
                                  type="text"
                                  placeholder={`Reply to ${comment.author}...`}
                                  value={replyText[comment.id] || ''}
                                  onChange={(e) => setReplyText({ ...replyText, [comment.id]: e.target.value })}
                                  onKeyDown={(e) => e.key === 'Enter' && handleAddReply(post.id, comment.id)}
                                  className="flex-1 bg-[#1a1a1a] border border-gray-700 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-blue-500"
                                  autoFocus
                                />
                                <button
                                  onClick={() => handleAddReply(post.id, comment.id)}
                                  className="bg-blue-500 text-white px-3 py-1.5 rounded-lg hover:bg-blue-600 transition-colors"
                                >
                                  <Send size={14} />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Add Comment */}
                    <div className="flex gap-2 mt-3">
                      <input
                        type="text"
                        placeholder="Add a comment..."
                        value={commentText[post.id] || ''}
                        onChange={(e) => setCommentText({ ...commentText, [post.id]: e.target.value })}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                        className="flex-1 bg-[#1a1a1a] border border-gray-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-pink-500"
                      />
                      <button
                        onClick={() => handleAddComment(post.id)}
                        className="bg-linear-to-r from-pink-500 to-orange-500 text-white px-4 py-2 rounded-lg hover:shadow-lg hover:shadow-pink-500/50"
                      >
                        <Send size={18} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-16 bg-[#2d2d2d] rounded-2xl border border-gray-800">
            <Loader size={40} className="mx-auto text-pink-400 animate-spin mb-4" />
            <p className="text-gray-400 text-lg">Loading posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16 bg-[#2d2d2d] rounded-2xl border border-gray-800">
            <p className="text-gray-400 text-lg mb-4">No posts yet</p>
            <Link
              to="/create"
              className="inline-block bg-linear-to-r from-pink-500 to-orange-500 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg hover:shadow-pink-500/50 transition-all"
            >
              Create First Post
            </Link>
          </div>
        ) : null}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-[#2d2d2d] rounded-2xl border border-gray-800 shadow-2xl p-8">
            <button
              onClick={() => setDeleteModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
                <Trash2 className="text-red-400" size={32} />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Delete Post?</h2>
              <p className="text-gray-400 mb-6">Are you sure you want to delete this post? This action cannot be undone.</p>
              
              <div className="flex gap-4">
                <button
                  onClick={() => setDeleteModalOpen(false)}
                  className="flex-1 bg-gray-800 text-white py-3 rounded-lg font-medium hover:bg-gray-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 bg-red-500 text-white py-3 rounded-lg font-medium hover:bg-red-600 transition-all"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Blog;