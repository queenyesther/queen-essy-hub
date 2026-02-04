import { useState, useEffect } from 'react';
import { Search, Image as ImageIcon, Upload, Check, X, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import { addGalleryImage, subscribeToGallery, deleteGalleryImage } from '../services/firestore';

const Gallery = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { openLoginModal } = useModal();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadPreview, setUploadPreview] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [galleryImages, setGalleryImages] = useState([]);

  // Load only current user's images from Firestore
  useEffect(() => {
    if (!currentUser?.uid) return;
    const unsubscribe = subscribeToGallery(currentUser.uid, (images) => {
      setGalleryImages(images);
    });
    return unsubscribe;
  }, [currentUser]);

  const filteredImages = galleryImages.filter(img => {
    return (img.title || '').toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleImageSelect = (image) => {
    setSelectedImage(image);
  };

  const handleContinueWithImage = () => {
    if (selectedImage) {
      // Save to localStorage so CreatePost can access it
      localStorage.setItem('selectedImage', selectedImage.url);
      navigate('/create');
    }
  };

  const handleUploadClick = () => {
    if (!currentUser) {
      setShowLoginPrompt(true);
    } else {
      setShowUploadModal(true);
    }
  };

  const handleLoginClick = () => {
    setShowLoginPrompt(false);
    openLoginModal();
  };

  // Handle file selection
  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image must be less than 5MB');
      return;
    }

    setUploadError('');

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload to Cloudinary
    await uploadToCloudinary(file);
  };

  // Upload to Cloudinary
  const uploadToCloudinary = async (file) => {
    setUploading(true);
    setUploadError('');

    try {
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

      if (!cloudName || !uploadPreset) {
        throw new Error('Cloudinary not configured. Please add VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET to your .env file.');
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Cloudinary error:', errorData); // Debug log
        throw new Error(errorData.error?.message || 'Upload failed. Please try again.');
      }

      const data = await response.json();

      // Save to Firestore
      const newImage = {
        url: data.secure_url,
        category: 'uploaded',
        title: 'My Upload',
        uploadedBy: currentUser.uid,
        uploaderName: currentUser.displayName || currentUser.email,
      };

      await addGalleryImage(newImage);
      setSelectedImage({ id: Date.now().toString(), ...newImage });
      setShowUploadModal(false);
      setUploadPreview(null);

      setShowSuccessModal(true);
    } catch (err) {
      setUploadError(err.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-linear-to-br from-pink-500 to-orange-500 flex items-center justify-center">
              <ImageIcon className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-linear-to-r from-pink-400 to-orange-400 bg-clip-text text-transparent">
                Image Gallery
              </h1>
              <p className="text-gray-400 text-sm">Choose an image for your next post</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <p className="text-gray-300">
              {filteredImages.length} {filteredImages.length === 1 ? 'image' : 'images'} in gallery
            </p>
            <button 
              onClick={handleUploadClick}
              className="bg-linear-to-r from-purple-500 to-violet-500 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105"
            >
              <Upload size={18} />
              <span>Upload Your Own</span>
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-[#2d2d2d] border border-gray-800 rounded-2xl p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search images..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-gray-700 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-pink-500 transition-colors"
              />
            </div>

          </div>
        </div>

        {/* Selected Image Banner */}
        {selectedImage && (
          <div className="bg-linear-to-r from-pink-500/10 to-orange-500/10 border border-pink-500/30 rounded-2xl p-4 mb-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-lg overflow-hidden">
                <img src={selectedImage.url} alt={selectedImage.title} className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="text-white font-medium">Selected: {selectedImage.title}</p>
                <p className="text-gray-400 text-sm">Ready to create your post</p>
              </div>
            </div>
            <button
              onClick={handleContinueWithImage}
              className="bg-linear-to-r from-pink-500 to-orange-500 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg hover:shadow-pink-500/50 transition-all duration-300"
            >
              Create Post
            </button>
          </div>
        )}

        {/* Image Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
          {filteredImages.map((image) => (
            <div
              key={image.id}
              onClick={() => handleImageSelect(image)}
              className={`group relative aspect-square rounded-xl overflow-hidden cursor-pointer transition-all duration-300 ${
                selectedImage?.id === image.id
                  ? 'ring-4 ring-pink-500 scale-95'
                  : 'hover:scale-105 hover:ring-2 hover:ring-pink-500/50'
              }`}
            >
              <img
                src={image.url}
                alt={image.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-white font-medium text-sm">{image.title}</p>
                  <p className="text-gray-300 text-xs capitalize">{image.uploaderName || image.category}</p>
                </div>
                {image.uploadedBy === currentUser?.uid && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteTarget(image);
                    }}
                    className="absolute top-2 left-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
                  >
                    <X className="text-white" size={16} />
                  </button>
                )}
              </div>

              {selectedImage?.id === image.id && (
                <div className="absolute top-2 right-2 w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center shadow-lg">
                  <Check className="text-white" size={20} />
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredImages.length === 0 && (
          <div className="text-center py-16">
            <ImageIcon className="mx-auto text-gray-600 mb-4" size={48} />
            <h3 className="text-xl font-semibold text-white mb-2">
              {galleryImages.length === 0 ? 'No images yet' : 'No images found'}
            </h3>
            <p className="text-gray-400 mb-6">
              {galleryImages.length === 0
                ? 'Be the first to upload an image to the gallery!'
                : 'Try adjusting your search or filter'}
            </p>
            {galleryImages.length === 0 ? (
              <button
                onClick={handleUploadClick}
                className="bg-linear-to-r from-purple-500 to-violet-500 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg hover:shadow-purple-500/50 transition-all"
              >
                Upload Your First Image
              </button>
            ) : (
              <button
                onClick={() => setSearchQuery('')}
                className="text-pink-400 hover:text-pink-300 font-medium"
              >
                Clear search
              </button>
            )}
          </div>
        )}

        {selectedImage && (
          <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
            <button
              onClick={handleContinueWithImage}
              className="bg-linear-to-r from-pink-500 to-orange-500 text-white px-8 py-4 rounded-full font-bold flex items-center space-x-3 hover:shadow-2xl hover:shadow-pink-500/50 transition-all duration-300 hover:scale-105"
            >
              <Check size={20} />
              <span>Continue with Selected Image</span>
            </button>
          </div>
        )}

      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-[#2d2d2d] rounded-2xl border border-gray-800 shadow-2xl">
            
            <button
              onClick={() => {
                setShowUploadModal(false);
                setUploadPreview(null);
                setUploadError('');
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
            >
              <X size={24} />
            </button>

            <div className="p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <Upload className="text-purple-400" size={32} />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Upload Your Image</h2>
                <p className="text-gray-400 text-sm">Choose an image from your device (max 5MB)</p>
              </div>

              {uploadError && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
                  <p className="text-red-400 text-sm">{uploadError}</p>
                </div>
              )}

              {uploadPreview && (
                <div className="mb-4">
                  <img src={uploadPreview} alt="Preview" className="w-full h-48 object-cover rounded-xl" />
                </div>
              )}

              <label className={`block w-full border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                uploading 
                  ? 'border-purple-500 bg-purple-500/10' 
                  : 'border-gray-700 hover:border-purple-500 hover:bg-purple-500/5'
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
                    <Loader className="animate-spin text-purple-400" size={40} />
                    <p className="text-purple-400 font-medium">Uploading...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <Upload className="text-gray-400" size={40} />
                    <div>
                      <p className="text-white font-medium mb-1">Click to select image</p>
                      <p className="text-gray-400 text-sm">PNG, JPG, GIF up to 5MB</p>
                    </div>
                  </div>
                )}
              </label>

              <div className="mt-6 bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                <h3 className="text-purple-400 font-semibold mb-2 text-sm">💡 Tips</h3>
                <ul className="text-gray-400 text-xs space-y-1">
                  <li>• Works on phone (camera/gallery) and laptop (files)</li>
                  <li>• Square or landscape orientation works best</li>
                  <li>• High-quality images get better engagement</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-[#2d2d2d] rounded-2xl border border-gray-800 shadow-2xl p-8">
            <button
              onClick={() => setShowLoginPrompt(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Upload className="text-purple-400" size={32} />
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-2">Login Required</h2>
              <p className="text-gray-400 mb-8">
                Please login first to upload your own images.
              </p>
              
              <div className="flex gap-4">
                <button
                  onClick={() => setShowLoginPrompt(false)}
                  className="flex-1 bg-gray-800 text-white py-3 rounded-lg font-medium hover:bg-gray-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLoginClick}
                  className="flex-1 bg-linear-to-r from-pink-500 to-orange-500 text-white py-3 rounded-lg font-medium hover:shadow-lg hover:shadow-pink-500/50 transition-all"
                >
                  Login
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-sm bg-[#2d2d2d] rounded-2xl border border-gray-800 shadow-2xl p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
              <X className="text-red-400" size={32} />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Delete Image?</h3>
            <p className="text-gray-400 mb-6">This will permanently remove the image from the gallery.</p>
            <div className="flex gap-4">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 bg-gray-800 text-white py-3 rounded-lg font-medium hover:bg-gray-700 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    await deleteGalleryImage(deleteTarget.id);
                    if (selectedImage?.id === deleteTarget.id) setSelectedImage(null);
                    setDeleteTarget(null);
                  } catch {
                    setUploadError('Failed to delete image. Please try again.');
                    setDeleteTarget(null);
                  }
                }}
                className="flex-1 bg-red-500 text-white py-3 rounded-lg font-medium hover:bg-red-600 transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-sm bg-[#2d2d2d] rounded-2xl border border-gray-800 shadow-2xl p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
              <Check className="text-green-400" size={32} />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Upload Successful</h3>
            <p className="text-gray-400 mb-6">Your image has been added to the gallery.</p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full bg-linear-to-r from-pink-500 to-orange-500 text-white py-3 rounded-lg font-medium hover:shadow-lg hover:shadow-pink-500/50 transition-all"
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;