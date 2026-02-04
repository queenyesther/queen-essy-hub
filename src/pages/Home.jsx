import { Camera, MessageSquare, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';

const Hero = () => {
  const { currentUser } = useAuth();
  const { openLoginModal } = useModal();

  const handleStartCreating = (e) => {
    if (!currentUser) {
      e.preventDefault();
      openLoginModal('Please login first to create posts!');
    }
  };

  return (
    <div className="relative min-h-screen bg-[#1a1a1a] overflow-hidden">
      {/* Decorative Background Circles */}
      <div className="absolute top-20 left-10 w-40 h-40 rounded-full bg-linear-to-br from-purple-600/30 to-pink-600/30 blur-3xl animate-pulse"></div>
      <div className="absolute top-40 right-20 w-60 h-60 rounded-full bg-linear-to-br from-orange-500/30 to-pink-500/30 blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute bottom-20 right-40 w-48 h-48 rounded-full bg-linear-to-br from-yellow-500/20 to-orange-500/20 blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        
        {/* Welcome Badge */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center space-x-2 bg-[#2d2d2d] border border-pink-500/20 rounded-full px-4 py-2">
            <Sparkles className="text-pink-400" size={18} />
            <span className="text-pink-400 text-sm font-medium">WELCOME TO</span>
          </div>
        </div>

        {/* Main Heading */}
        <div className="text-center mb-8">
          <h1 className="text-6xl sm:text-7xl md:text-8xl font-bold mb-4">
            <span className="bg-linear-to-r from-pink-400 via-pink-500 to-orange-500 bg-clip-text text-transparent">
              Queen Essy
            </span>
          </h1>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white">
            Interactive Hub
          </h2>
        </div>

        {/* Subtitle */}
        <p className="text-center text-gray-400 text-lg md:text-xl max-w-3xl mx-auto mb-12 leading-relaxed">
          Where creativity meets community. Share your stories, capture moments, 
          and connect with others in this vibrant digital space.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link
            to="/create"
            onClick={handleStartCreating}
            className="group relative bg-linear-to-r from-pink-500 to-orange-500 text-white px-8 py-4 rounded-xl font-semibold flex items-center space-x-2 hover:shadow-2xl hover:shadow-pink-500/50 transition-all duration-300 hover:scale-105"
          >
            <Camera size={20} />
            <span>Start Creating</span>
          </Link>

          <Link
            to="/blog"
            className="group relative bg-transparent border-2 border-pink-500 text-pink-400 px-8 py-4 rounded-xl font-semibold flex items-center space-x-2 hover:bg-pink-500/10 hover:shadow-xl hover:shadow-pink-500/30 transition-all duration-300"
          >
            <MessageSquare size={20} />
            <span>Explore Posts</span>
          </Link>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          
          {/* Card 1 */}
          <Link
            to="/create"
            onClick={(e) => {
              if (!currentUser) {
                e.preventDefault();
                openLoginModal('Please login to create posts');
              }
            }}
            className="bg-[#2d2d2d] border border-gray-800 rounded-2xl p-6 hover:border-pink-500/50 transition-all duration-300 hover:scale-105 group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-linear-to-br from-pink-500/20 to-orange-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <MessageSquare className="text-pink-400" size={24} />
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">Share Stories</h3>
            <p className="text-gray-400 text-sm">
              Express yourself through captivating posts and connect with a community that values your voice.
            </p>
          </Link>

          {/* Card 2 */}
          <Link
            to="/gallery"
            className="bg-[#2d2d2d] border border-gray-800 rounded-2xl p-6 hover:border-pink-500/50 transition-all duration-300 hover:scale-105 group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-linear-to-br from-orange-500/20 to-pink-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Camera className="text-orange-400" size={24} />
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">Capture Moments</h3>
            <p className="text-gray-400 text-sm">
              Choose from our gallery or upload your own images to bring your stories to life.
            </p>
          </Link>

          {/* Card 3 */}
          <Link
            to="/blog"
            className="bg-[#2d2d2d] border border-gray-800 rounded-2xl p-6 hover:border-pink-500/50 transition-all duration-300 hover:scale-105 group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-linear-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Sparkles className="text-purple-400" size={24} />
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">Build Community</h3>
            <p className="text-gray-400 text-sm">
              Engage with others through comments, likes, and meaningful conversations.
            </p>
          </Link>

        </div>

      </div>
    </div>
  );
};

export default Hero;