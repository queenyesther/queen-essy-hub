import { useState, useEffect, useRef } from 'react';
import { Search, MessageCircle, Menu, X, PenSquare, LogOut, User as UserIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import SearchModal from './search/SearchModal';
import { getUserProfile } from '../services/firestore';
import logo from '../assets/logo.png';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);

  const userMenuRef = useRef(null);

  const { currentUser, logout } = useAuth();
  const { openLoginModal } = useModal();

  // Close user menu on outside click
  useEffect(() => {
    if (!showUserMenu) return;
    const handleClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showUserMenu]);

  // Fetch profile picture from Firestore
  useEffect(() => {
    let isMounted = true;
    const fetchProfile = async () => {
      if (!currentUser) {
        if (isMounted) setProfilePicture(null);
        return;
      }
      const profile = await getUserProfile(currentUser.uid);
      if (isMounted && profile?.photoURL) {
        setProfilePicture(profile.photoURL);
      }
    };
    fetchProfile();
    return () => { isMounted = false; };
  }, [currentUser]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Blog', path: '/blog' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'About', path: '/about' },
  ];

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
    setShowLogoutModal(false);
    setIsMobileMenuOpen(false);
  };

  const getUserInitials = () => {
    if (!currentUser) return '';
    if (currentUser.displayName) {
      return currentUser.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return currentUser.email[0].toUpperCase();
  };

  return (
    <>
      <nav className="bg-[#1a1a1a] border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo Section - Left */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-full bg-linear-to-br from-pink-500 to-orange-500 flex items-center justify-center">
                <img 
                  src={logo}
                  alt="Queen Essy" 
                  className="w-8 h-8 rounded-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = '<span class="text-white font-bold text-sm">QE</span>';
                  }}
                />
              </div>
              <span className="text-white font-semibold text-lg hidden md:block group-hover:text-pink-400 transition-colors">
                Queen Essy Interactive Hub
              </span>
              <span className="text-white font-semibold text-lg md:hidden">
                Queen Essy
              </span>
            </Link>

            {/* Navigation Links - Center (Desktop) */}
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className="text-gray-300 hover:text-pink-400 transition-colors duration-200 text-sm font-medium relative group"
                >
                  {link.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-linear-to-r from-pink-500 to-orange-500 group-hover:w-full transition-all duration-300"></span>
                </Link>
              ))}
            </div>

            {/* Action Buttons - Right (Desktop) */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Search Icon */}
              <button 
                onClick={() => setShowSearchModal(true)}
                className="text-gray-300 hover:text-pink-400 transition-colors p-2 rounded-lg hover:bg-gray-800"
              >
                <Search size={20} />
              </button>

              {/* Contact/User Icon */}
              {currentUser ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="w-10 h-10 rounded-full bg-linear-to-br from-pink-500 to-orange-500 flex items-center justify-center hover:scale-110 transition-transform overflow-hidden"
                  >
                    {profilePicture ? (
                      <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white font-bold text-sm">{getUserInitials()}</span>
                    )}
                  </button>

                  {/* User Dropdown */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-[#2d2d2d] border border-gray-800 rounded-xl shadow-xl py-2">
                      <div className="px-4 py-2 border-b border-gray-800">
                        <p className="text-white font-semibold text-sm">{currentUser.displayName || 'User'}</p>
                        <p className="text-gray-400 text-xs truncate">{currentUser.email}</p>
                      </div>
                      <Link
                        to={`/profile/${currentUser.displayName || currentUser.email?.split('@')[0] || 'user'}`}
                        className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <UserIcon size={16} />
                        <span className="text-sm">My Profile</span>
                      </Link>
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          setShowLogoutModal(true);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-red-400 hover:bg-gray-800 transition-colors"
                      >
                        <LogOut size={16} />
                        <span className="text-sm">Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button 
                  onClick={openLoginModal}
                  className="text-gray-300 hover:text-pink-400 transition-colors p-2 rounded-lg hover:bg-gray-800"
                >
                  <MessageCircle size={20} />
                </button>
              )}

              {/* Create Post Button */}
              {currentUser ? (
                <Link 
                  to="/create"
                  className="bg-linear-to-r from-pink-500 to-orange-500 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 hover:shadow-lg hover:shadow-pink-500/50 transition-all duration-300 hover:scale-105"
                >
                  <PenSquare size={18} />
                  <span>Create Post</span>
                </Link>
              ) : (
                <button
                  onClick={() => setShowLoginPrompt(true)}
                  className="bg-linear-to-r from-pink-500 to-orange-500 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 hover:shadow-lg hover:shadow-pink-500/50 transition-all duration-300 hover:scale-105"
                >
                  <PenSquare size={18} />
                  <span>Create Post</span>
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-gray-300 hover:text-pink-400 transition-colors p-2"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-[#2d2d2d] border-t border-gray-800">
            <div className="px-4 py-3 space-y-3">
              {/* Mobile Navigation Links */}
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className="block text-gray-300 hover:text-pink-400 transition-colors py-2 text-sm font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}

              {/* Mobile Action Buttons */}
              <div className="pt-3 border-t border-gray-700 space-y-3">
                <button 
                  onClick={() => {
                    setShowSearchModal(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center space-x-3 text-gray-300 hover:text-pink-400 transition-colors py-2"
                >
                  <Search size={20} />
                  <span className="text-sm font-medium">Search</span>
                </button>

                {currentUser ? (
                  <>
                    <div className="py-2 border-b border-gray-700">
                      <p className="text-white font-semibold text-sm">{currentUser.displayName || 'User'}</p>
                      <p className="text-gray-400 text-xs">{currentUser.email}</p>
                    </div>
                    <Link
                      to={`/profile/${currentUser.displayName || currentUser.email?.split('@')[0] || 'user'}`}
                      className="w-full flex items-center space-x-3 text-gray-300 hover:text-pink-400 transition-colors py-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <UserIcon size={20} />
                      <span className="text-sm font-medium">My Profile</span>
                    </Link>
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setShowLogoutModal(true);
                      }}
                      className="w-full flex items-center space-x-3 text-gray-300 hover:text-red-400 transition-colors py-2"
                    >
                      <LogOut size={20} />
                      <span className="text-sm font-medium">Logout</span>
                    </button>
                    <Link
                      to="/create"
                      className="w-full bg-linear-to-r from-pink-500 to-orange-500 text-white px-4 py-3 rounded-lg font-medium flex items-center justify-center space-x-2 hover:shadow-lg hover:shadow-pink-500/50 transition-all"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <PenSquare size={18} />
                      <span>Create Post</span>
                    </Link>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => {
                        openLoginModal();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center space-x-3 text-gray-300 hover:text-pink-400 transition-colors py-2"
                    >
                      <MessageCircle size={20} />
                      <span className="text-sm font-medium">Login / Sign Up</span>
                    </button>
                    <button
                      className="w-full bg-linear-to-r from-pink-500 to-orange-500 text-white px-4 py-3 rounded-lg font-medium flex items-center justify-center space-x-2 hover:shadow-lg hover:shadow-pink-500/50 transition-all"
                      onClick={() => {
                        setShowLoginPrompt(true);
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <PenSquare size={18} />
                      <span>Create Post</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Search Modal */}
      <SearchModal 
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
      />
      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-sm bg-[#2d2d2d] rounded-2xl border border-gray-800 shadow-2xl p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
              <LogOut className="text-red-400" size={32} />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Logout?</h3>
            <p className="text-gray-400 mb-6">Are you sure you want to log out of your account?</p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 bg-gray-800 text-white py-3 rounded-lg font-medium hover:bg-gray-700 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 bg-red-500 text-white py-3 rounded-lg font-medium hover:bg-red-600 transition-all"
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-[#2d2d2d] rounded-xl shadow-xl p-6 w-full max-w-sm text-center">
            <h2 className="text-white text-lg font-semibold mb-2">Login Required</h2>
            <p className="text-gray-300 mb-4">Please login first to create a post.</p>
            <div className="flex justify-center gap-3">
              <button
                className="bg-pink-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-pink-600 transition-colors"
                onClick={() => {
                  setShowLoginPrompt(false);
                  openLoginModal();
                }}
              >
                Login
              </button>
              <button
                className="bg-gray-700 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors"
                onClick={() => setShowLoginPrompt(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;