import {
  collection,
  doc,
  addDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  increment,
  setDoc,
  arrayUnion,
  arrayRemove,
  where,
} from 'firebase/firestore';
import { db } from '../firebase/config';

// ============ POSTS ============

const postsRef = collection(db, 'posts');

export async function createPost(postData) {
  const docRef = await addDoc(postsRef, {
    ...postData,
    likes: 0,
    likedBy: [],
    comments: [],
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export function subscribeToPosts(callback) {
  const q = query(postsRef, orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const posts = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(posts);
  });
}

export async function deletePostById(postId) {
  await deleteDoc(doc(db, 'posts', postId));
}

export async function toggleLikePost(postId, userId) {
  const postRef = doc(db, 'posts', postId);
  const postSnap = await getDoc(postRef);
  if (!postSnap.exists()) return;

  const likedBy = postSnap.data().likedBy || [];
  const alreadyLiked = likedBy.includes(userId);

  await updateDoc(postRef, {
    likedBy: alreadyLiked ? arrayRemove(userId) : arrayUnion(userId),
    likes: increment(alreadyLiked ? -1 : 1),
  });
}

export async function addCommentToPost(postId, comment) {
  const postRef = doc(db, 'posts', postId);
  await updateDoc(postRef, {
    comments: arrayUnion({
      id: Date.now().toString(),
      ...comment,
      time: new Date().toISOString(),
      likes: 0,
      likedBy: [],
      replies: [],
    }),
  });
}

export async function toggleCommentLike(postId, commentId, userId) {
  const postRef = doc(db, 'posts', postId);
  const postSnap = await getDoc(postRef);
  if (!postSnap.exists()) return;

  const comments = postSnap.data().comments || [];
  const updatedComments = comments.map((comment) => {
    if (comment.id === commentId) {
      const likedBy = comment.likedBy || [];
      const alreadyLiked = likedBy.includes(userId);
      return {
        ...comment,
        likes: (comment.likes || 0) + (alreadyLiked ? -1 : 1),
        likedBy: alreadyLiked
          ? likedBy.filter((id) => id !== userId)
          : [...likedBy, userId],
      };
    }
    return comment;
  });

  await updateDoc(postRef, { comments: updatedComments });
}

export async function addReplyToComment(postId, commentId, reply) {
  const postRef = doc(db, 'posts', postId);
  const postSnap = await getDoc(postRef);
  if (!postSnap.exists()) return;

  const comments = postSnap.data().comments || [];
  const updatedComments = comments.map((comment) => {
    if (comment.id === commentId) {
      return {
        ...comment,
        replies: [
          ...(comment.replies || []),
          {
            id: Date.now().toString(),
            ...reply,
            time: new Date().toISOString(),
            likes: 0,
            likedBy: [],
          },
        ],
      };
    }
    return comment;
  });

  await updateDoc(postRef, { comments: updatedComments });
}

export async function toggleReplyLike(postId, commentId, replyId, userId) {
  const postRef = doc(db, 'posts', postId);
  const postSnap = await getDoc(postRef);
  if (!postSnap.exists()) return;

  const comments = postSnap.data().comments || [];
  const updatedComments = comments.map((comment) => {
    if (comment.id === commentId) {
      const replies = (comment.replies || []).map((reply) => {
        if (reply.id === replyId) {
          const likedBy = reply.likedBy || [];
          const alreadyLiked = likedBy.includes(userId);
          return {
            ...reply,
            likes: (reply.likes || 0) + (alreadyLiked ? -1 : 1),
            likedBy: alreadyLiked
              ? likedBy.filter((id) => id !== userId)
              : [...likedBy, userId],
          };
        }
        return reply;
      });
      return { ...comment, replies };
    }
    return comment;
  });

  await updateDoc(postRef, { comments: updatedComments });
}

// ============ GALLERY ============

const galleryRef = collection(db, 'gallery');

export async function addGalleryImage(imageData) {
  const docRef = await addDoc(galleryRef, {
    ...imageData,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function deleteGalleryImage(imageId) {
  await deleteDoc(doc(db, 'gallery', imageId));
}

export function subscribeToGallery(userId, callback) {
  const q = query(galleryRef, where('uploadedBy', '==', userId), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const images = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(images);
  });
}

// ============ USER PROFILES ============

export async function getUserProfile(uid) {
  const docSnap = await getDoc(doc(db, 'users', uid));
  return docSnap.exists() ? docSnap.data() : null;
}

export async function updateUserProfile(uid, data) {
  await setDoc(doc(db, 'users', uid), data, { merge: true });
}
