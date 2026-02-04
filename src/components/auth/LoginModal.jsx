import { useState } from 'react';
import { X, Mail, Lock, User, Loader, ArrowLeft, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useModal } from '../../context/ModalContext';

function LoginModal() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const { signup, login, resetPassword, loading } = useAuth();
  const { isLoginModalOpen, closeLoginModal, loginModalMessage } = useModal();

  if (!isLoginModalOpen) return null;

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (!resetEmail) {
      setError('Please enter your email address');
      return;
    }

    setResetLoading(true);
    const result = await resetPassword(resetEmail);
    setResetLoading(false);

    if (result.success) {
      setResetSent(true);
      setError('');
    } else {
      setError(result.error);
    }
  };

  const handleBackToLogin = () => {
    setShowForgotPassword(false);
    setResetSent(false);
    setResetEmail('');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (!isLogin && !username) {
      setError('Please enter a username');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      let result;
      if (isLogin) {
        result = await login(email, password);
      } else {
        result = await signup(email, password, username);
      }

      if (result.success) {
        closeLoginModal();
        // Clear form
        setEmail('');
        setPassword('');
        setUsername('');
        setError('');
      } else {
        setError(result.error || 'Authentication failed');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-[#2d2d2d] rounded-2xl border border-gray-800 shadow-2xl">
        
        {/* Close Button */}
        <button
          onClick={closeLoginModal}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        {/* Content */}
        <div className="p-8">

          {showForgotPassword ? (
            <>
              {/* Forgot Password View */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-linear-to-br from-pink-500 to-orange-500 flex items-center justify-center">
                  <Mail className="text-white" size={28} />
                </div>
                <h2 className="text-3xl font-bold bg-linear-to-r from-pink-400 to-orange-400 bg-clip-text text-transparent mb-2">
                  Reset Password
                </h2>
                <p className="text-gray-400">
                  {resetSent ? 'Check your inbox for the reset link' : 'Enter your email to receive a reset link'}
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {resetSent ? (
                <div className="text-center">
                  <div className="mb-6 p-4 bg-green-500/10 border border-green-500/50 rounded-lg">
                    <CheckCircle className="mx-auto text-green-400 mb-2" size={32} />
                    <p className="text-green-400 text-sm">
                      Password reset email sent to <span className="font-semibold">{resetEmail}</span>
                    </p>
                  </div>
                  <button
                    onClick={handleBackToLogin}
                    className="w-full bg-linear-to-r from-pink-500 to-orange-500 text-white py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-pink-500/50 transition-all flex items-center justify-center gap-2"
                  >
                    <ArrowLeft size={18} />
                    Back to Login
                  </button>
                </div>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        placeholder="your@email.com"
                        autoFocus
                        className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-pink-500 transition-colors"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="w-full bg-linear-to-r from-pink-500 to-orange-500 text-white py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-pink-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {resetLoading ? (
                      <>
                        <Loader className="animate-spin" size={20} />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <span>Send Reset Link</span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleBackToLogin}
                    className="w-full text-gray-400 hover:text-white py-2 text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <ArrowLeft size={16} />
                    Back to Login
                  </button>
                </form>
              )}
            </>
          ) : (
            <>
              {/* Login / Sign Up View */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-linear-to-br from-pink-500 to-orange-500 flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">QE</span>
                </div>
                <h2 className="text-3xl font-bold bg-linear-to-r from-pink-400 to-orange-400 bg-clip-text text-transparent mb-2">
                  {isLogin ? 'Welcome Back!' : 'Join Queen Essy'}
                </h2>
                {loginModalMessage && (
                  <div className="mb-2 p-2 bg-yellow-500/10 border border-yellow-500/50 rounded-lg">
                    <p className="text-yellow-400 text-sm">{loginModalMessage}</p>
                  </div>
                )}
                <p className="text-gray-400">
                  {isLogin ? 'Login to continue your journey' : 'Create your account to start sharing'}
                </p>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 mb-6 bg-[#1a1a1a] rounded-lg p-1">
                <button
                  onClick={() => {
                    setIsLogin(true);
                    setError('');
                  }}
                  className={`flex-1 py-2 rounded-lg font-medium transition-all ${
                    isLogin
                      ? 'bg-linear-to-r from-pink-500 to-orange-500 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    setIsLogin(false);
                    setError('');
                  }}
                  className={`flex-1 py-2 rounded-lg font-medium transition-all ${
                    !isLogin
                      ? 'bg-linear-to-r from-pink-500 to-orange-500 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Sign Up
                </button>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">

                {/* Username (Sign Up Only) */}
                {!isLogin && (
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Username
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Choose a username"
                        className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-pink-500 transition-colors"
                      />
                    </div>
                  </div>
                )}

                {/* Email */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-pink-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-gray-300 text-sm font-medium">
                      Password
                    </label>
                    {isLogin && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowForgotPassword(true);
                          setError('');
                          setResetEmail(email);
                        }}
                        className="text-pink-400 hover:text-pink-300 text-xs font-medium"
                      >
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-pink-500 transition-colors"
                    />
                  </div>
                  <p className="text-gray-500 text-xs mt-1">At least 6 characters</p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-linear-to-r from-pink-500 to-orange-500 text-white py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-pink-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader className="animate-spin" size={20} />
                      <span>{isLogin ? 'Logging in...' : 'Creating account...'}</span>
                    </>
                  ) : (
                    <span>{isLogin ? 'Login' : 'Create Account'}</span>
                  )}
                </button>
              </form>

              {/* Footer */}
              <div className="mt-6 text-center">
                <p className="text-gray-400 text-sm">
                  {isLogin ? "Don't have an account? " : 'Already have an account? '}
                  <button
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setError('');
                    }}
                    className="text-pink-400 hover:text-pink-300 font-medium"
                  >
                    {isLogin ? 'Sign Up' : 'Login'}
                  </button>
                </p>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}

export default LoginModal;
