import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { usePosts } from '../context/PostsContext';
import { useAuth } from '../context/AuthContext';
import { Heart, MessageSquare, Camera, X, Upload as UploadIcon, Loader } from 'lucide-react';
import { getUserProfile, updateUserProfile } from '../services/firestore';

function Profile() {
  const { username } = useParams();
  const { posts } = usePosts();
  const { currentUser } = useAuth();
  
  const [showImageModal, setShowImageModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  
  const isOwnProfile = currentUser?.displayName === username ||
                       currentUser?.email?.split('@')[0] === username;

  // Filter posts by this user - use authorId for own profile, fall back to name matching for others
  const userPosts = posts.filter(post =>
    isOwnProfile
      ? post.authorId === currentUser?.uid
      : post.authorUsername === `@${username}` || post.authorName === username
  );
  
  // Get user info
  const userInfo = userPosts[0] || {
    authorName: username,
    authorAvatar: username[0]?.toUpperCase() || 'U'
  };

  // Load profile picture from Firestore
  useEffect(() => {
    if (currentUser) {
      getUserProfile(currentUser.uid).then((profile) => {
        if (profile?.photoURL) {
          setProfilePicture(profile.photoURL);
        }
      });
    }
  }, [currentUser]);

  // Handle profile picture upload
  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image must be less than 5MB');
      return;
    }

    setUploadError('');
    setUploading(true);

    try {
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

      if (!cloudName || !uploadPreset) {
        throw new Error('Cloudinary not configured');
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: 'POST', body: formData }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Cloudinary error:', errorData);
        throw new Error(errorData.error?.message || 'Upload failed');
      }

      const data = await response.json();
      
      // Save to Firestore
      await updateUserProfile(currentUser.uid, { photoURL: data.secure_url });
      setProfilePicture(data.secure_url);
      setShowUploadModal(false);
    } catch (err) {
      setUploadError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] py-8">
      <div className="max-w-4xl mx-auto px-4">
        
        {/* Profile Header */}
        <div className="bg-[#2d2d2d] rounded-2xl p-8 mb-8 border border-gray-800">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div 
                onClick={() => profilePicture && setShowImageModal(true)}
                className={`w-24 h-24 rounded-full bg-linear-to-br from-pink-500 to-orange-500 flex items-center justify-center overflow-hidden ${profilePicture ? 'cursor-pointer hover:opacity-80' : ''} transition-opacity`}
              >
                {profilePicture ? (
                  <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white font-bold text-3xl">
                    {userInfo.authorAvatar}
                  </span>
                )}
              </div>
              
              {isOwnProfile && (
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="absolute bottom-0 right-0 w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center hover:bg-pink-600 transition-colors"
                >
                  <Camera className="text-white" size={16} />
                </button>
              )}
            </div>
            
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {userInfo.authorName}
              </h1>
              <p className="text-gray-400">
                {userPosts.length} {userPosts.length === 1 ? 'post' : 'posts'}
              </p>
              {isOwnProfile && (
                <p className="text-pink-400 text-sm mt-1">Your Profile</p>
              )}
            </div>
          </div>
        </div>

        {/* User's Posts */}
        <h2 className="text-2xl font-bold text-white mb-6">
          {isOwnProfile ? 'Your Posts' : `${username}'s Posts`}
        </h2>

        {userPosts.length === 0 ? (
          <div className="text-center py-16 bg-[#2d2d2d] rounded-2xl border border-gray-800">
            <p className="text-gray-400 text-lg">No posts yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {userPosts.map(post => (
              <div key={post.id} className="bg-[#2d2d2d] rounded-xl overflow-hidden border border-gray-800 hover:border-pink-500/50 transition-all">
                <img src={post.image} alt="Post" className="w-full h-48 object-cover" />
                <div className="p-4">
                  <p className="text-gray-300 text-sm line-clamp-3 mb-3">
                    {post.content}
                  </p>
                  <div className="flex items-center gap-4 text-gray-400 text-sm">
                    <span className="flex items-center gap-1">
                      <Heart size={16} />
                      {post.likes}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare size={16} />
                      {(post.comments || []).length}
                    </span>
                    <span>{post.createdAt?.toDate ? post.createdAt.toDate().toLocaleDateString() : post.timestamp || ''}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Full Image Modal */}
      {showImageModal && profilePicture && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm" onClick={() => setShowImageModal(false)}>
          <button
            onClick={() => setShowImageModal(false)}
            className="absolute top-4 right-4 text-white hover:text-pink-400 transition-colors"
          >
            <X size={32} />
          </button>
          <img src={profilePicture} alt="Profile" className="max-w-full max-h-full rounded-xl" />
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-[#2d2d2d] rounded-2xl border border-gray-800 shadow-2xl">
            <button
              onClick={() => setShowUploadModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
            >
              <X size={24} />
            </button>

            <div className="p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-pink-500/20 flex items-center justify-center">
                  <Camera className="text-pink-400" size={32} />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Update Profile Picture</h2>
                <p className="text-gray-400 text-sm">Choose a photo from your device</p>
              </div>

              {uploadError && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
                  <p className="text-red-400 text-sm">{uploadError}</p>
                </div>
              )}

              <label className={`block w-full border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                uploading ? 'border-pink-500 bg-pink-500/10' : 'border-gray-700 hover:border-pink-500 hover:bg-pink-500/5'
              }`}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  disabled={uploading}
                  className="hidden"
                />
                
                {uploading ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader className="animate-spin text-pink-400" size={40} />
                    <p className="text-pink-400 font-medium">Uploading...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <UploadIcon className="text-gray-400" size={40} />
                    <div>
                      <p className="text-white font-medium mb-1">Click to select photo</p>
                      <p className="text-gray-400 text-sm">PNG, JPG up to 5MB</p>
                    </div>
                  </div>
                )}
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;