import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import LoginModal from './components/auth/LoginModal';
import Home from './pages/Home';
import Blog from './pages/Blog';
import Gallery from './pages/Gallery';
import About from './pages/About';
import CreatePost from './pages/CreatePost';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import { useAuth } from './context/AuthContext';
import { useModal } from './context/ModalContext';
import logo from './assets/logo.png';

function App() {
  const { currentUser } = useAuth();
  const { openLoginModal } = useModal();

  if (!currentUser) {
    return (
      <>
        <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
          <div className="text-center px-4">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-linear-to-br from-pink-500 to-orange-500 flex items-center justify-center overflow-hidden">
              <img
                src={logo}
                alt="Queen Essy"
                className="w-20 h-20 rounded-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = '<span class="text-white text-4xl font-bold">QE</span>';
                }}
              />
            </div>

            <h1 className="text-5xl font-bold bg-linear-to-r from-pink-400 to-orange-400 bg-clip-text text-transparent mb-4">
              Queen Essy Interactive Hub
            </h1>
            <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">
              Share your stories, connect with the community, and explore creative moments.
            </p>

            <button
              onClick={() => openLoginModal()}
              className="bg-linear-to-r from-pink-500 to-orange-500 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:shadow-lg hover:shadow-pink-500/50 transition-all duration-300 hover:scale-105"
            >
              Login / Sign Up
            </button>
          </div>
        </div>
        <LoginModal />
      </>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-[#1a1a1a]">
        <Navbar />
        <LoginModal />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/about" element={<About />} />
          <Route path="/create" element={<CreatePost />} />
          <Route path="/profile/:username" element={<Profile />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;