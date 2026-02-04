/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import {
  subscribeToPosts,
  createPost,
  deletePostById,
  toggleLikePost,
  addCommentToPost,
  toggleCommentLike as toggleCommentLikeFirestore,
  addReplyToComment,
  toggleReplyLike as toggleReplyLikeFirestore,
} from '../services/firestore';
import { useAuth } from './AuthContext';

const PostsContext = createContext();

export function PostsProvider({ children }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  // Subscribe to Firestore posts in real-time
  useEffect(() => {
    const unsubscribe = subscribeToPosts((firestorePosts) => {
      // Merge Firestore data with local UI state (showComments)
      setPosts((prev) => {
        const showCommentsMap = {};
        prev.forEach((p) => {
          if (p.showComments) showCommentsMap[p.id] = true;
        });
        return firestorePosts.map((p) => ({
          ...p,
          liked: currentUser ? (p.likedBy || []).includes(currentUser.uid) : false,
          showComments: !!showCommentsMap[p.id],
        }));
      });
      setLoading(false);
    });
    return unsubscribe;
  }, [currentUser]);

  // Add a new post to Firestore
  const addPost = async (postData) => {
    await createPost(postData);
  };

  // Like/Unlike a post in Firestore
  const toggleLike = async (postId) => {
    if (!currentUser) return;
    // Optimistic UI update
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              liked: !post.liked,
              likes: post.liked ? post.likes - 1 : post.likes + 1,
            }
          : post
      )
    );
    try {
      await toggleLikePost(postId, currentUser.uid);
    } catch {
      // Revert optimistic update on failure
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? {
                ...post,
                liked: !post.liked,
                likes: post.liked ? post.likes - 1 : post.likes + 1,
              }
            : post
        )
      );
    }
  };

  // Toggle comments visibility (local only)
  const toggleComments = (postId) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId ? { ...post, showComments: !post.showComments } : post
      )
    );
  };

  // Add a comment to Firestore
  const addComment = async (postId, commentText, author) => {
    try {
      await addCommentToPost(postId, {
        author,
        text: commentText,
        authorId: currentUser?.uid || null,
      });
    } catch {
      throw new Error('Failed to add comment');
    }
  };

  // Delete a post from Firestore
  const deletePost = async (postId) => {
    try {
      await deletePostById(postId);
    } catch {
      throw new Error('Failed to delete post');
    }
  };

  // Like/Unlike a comment
  const toggleCommentLike = async (postId, commentId) => {
    if (!currentUser) return;
    // Optimistic UI update
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post;
        return {
          ...post,
          comments: (post.comments || []).map((c) => {
            if (c.id !== commentId) return c;
            const likedBy = c.likedBy || [];
            const alreadyLiked = likedBy.includes(currentUser.uid);
            return {
              ...c,
              likes: (c.likes || 0) + (alreadyLiked ? -1 : 1),
              likedBy: alreadyLiked
                ? likedBy.filter((id) => id !== currentUser.uid)
                : [...likedBy, currentUser.uid],
            };
          }),
        };
      })
    );
    try {
      await toggleCommentLikeFirestore(postId, commentId, currentUser.uid);
    } catch {
      // Revert on failure — real-time listener will correct state
    }
  };

  // Reply to a comment
  const addReply = async (postId, commentId, text, author) => {
    try {
      await addReplyToComment(postId, commentId, {
        author,
        text,
        authorId: currentUser?.uid || null,
      });
    } catch {
      throw new Error('Failed to add reply');
    }
  };

  // Like/Unlike a reply
  const toggleReplyLike = async (postId, commentId, replyId) => {
    if (!currentUser) return;
    // Optimistic UI update
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post;
        return {
          ...post,
          comments: (post.comments || []).map((c) => {
            if (c.id !== commentId) return c;
            return {
              ...c,
              replies: (c.replies || []).map((r) => {
                if (r.id !== replyId) return r;
                const likedBy = r.likedBy || [];
                const alreadyLiked = likedBy.includes(currentUser.uid);
                return {
                  ...r,
                  likes: (r.likes || 0) + (alreadyLiked ? -1 : 1),
                  likedBy: alreadyLiked
                    ? likedBy.filter((id) => id !== currentUser.uid)
                    : [...likedBy, currentUser.uid],
                };
              }),
            };
          }),
        };
      })
    );
    try {
      await toggleReplyLikeFirestore(postId, commentId, replyId, currentUser.uid);
    } catch {
      // Revert on failure — real-time listener will correct state
    }
  };

  const value = {
    posts,
    loading,
    addPost,
    toggleLike,
    toggleComments,
    addComment,
    deletePost,
    toggleCommentLike,
    addReply,
    toggleReplyLike,
  };

  return (
    <PostsContext.Provider value={value}>
      {children}
    </PostsContext.Provider>
  );
}

export function usePosts() {
  const context = useContext(PostsContext);
  if (!context) {
    throw new Error('usePosts must be used within a PostsProvider');
  }
  return context;
}

export default PostsContext;
