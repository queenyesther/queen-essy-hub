import { Target, Sparkles, Heart, MessageCircle, Image, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

function About() {
  return (
    <div className="min-h-screen bg-[#1a1a1a] py-12">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-[#2d2d2d] border border-pink-500/20 rounded-full px-5 py-2 mb-6">
            <Sparkles className="text-pink-400" size={18} />
            <span className="text-pink-400 text-sm font-medium">ABOUT US</span>
          </div>
          
          <h1 className="text-6xl font-bold mb-6 bg-linear-to-r from-pink-400 to-orange-400 bg-clip-text text-transparent">
            Queen Essy Interactive Hub
          </h1>
          
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            A vibrant digital space where creativity meets community. We empower individuals 
            to share their stories, connect through meaningful conversations, and build 
            lasting relationships in a supportive environment.
          </p>
        </div>

        {/* Mission */}
        <div className="bg-[#2d2d2d] border border-gray-800 rounded-3xl p-12 mb-16">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-linear-to-br from-pink-500 to-orange-500 flex items-center justify-center shrink-0">
              <Target className="text-white" size={28} />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white mb-4">Our Mission</h2>
              <p className="text-gray-300 text-lg leading-relaxed mb-4">
                Queen Essy Hub exists to break down barriers in digital storytelling. We believe 
                everyone has a story worth sharing, and we've created a platform that makes it 
                simple, beautiful, and engaging to do just that.
              </p>
              <p className="text-gray-300 text-lg leading-relaxed">
                Our goal is to foster a community where creativity thrives, connections deepen, 
                and every voice matters. Whether you're sharing a moment of inspiration, a personal 
                reflection, or a creative idea, Queen Essy Hub is your canvas.
              </p>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold text-center mb-12 bg-linear-to-r from-pink-400 to-orange-400 bg-clip-text text-transparent">
            How It Works
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-[#2d2d2d] border border-gray-800 rounded-2xl p-6 hover:border-pink-500/50 transition-all">
              <div className="text-6xl font-bold text-pink-500/20 mb-4">01</div>
              <h3 className="text-xl font-semibold text-white mb-3">Create Account</h3>
              <p className="text-gray-400">Sign up with just a username and password. Quick, simple, and secure.</p>
            </div>

            <div className="bg-[#2d2d2d] border border-gray-800 rounded-2xl p-6 hover:border-pink-500/50 transition-all">
              <div className="text-6xl font-bold text-pink-500/20 mb-4">02</div>
              <h3 className="text-xl font-semibold text-white mb-3">Choose Your Image</h3>
              <p className="text-gray-400">Browse our gallery and select an image that resonates with your story.</p>
            </div>

            <div className="bg-[#2d2d2d] border border-gray-800 rounded-2xl p-6 hover:border-pink-500/50 transition-all">
              <div className="text-6xl font-bold text-pink-500/20 mb-4">03</div>
              <h3 className="text-xl font-semibold text-white mb-3">Write Your Story</h3>
              <p className="text-gray-400">Craft your message in up to 150 words. Share experiences, thoughts, or ideas.</p>
            </div>

            <div className="bg-[#2d2d2d] border border-gray-800 rounded-2xl p-6 hover:border-pink-500/50 transition-all">
              <div className="text-6xl font-bold text-pink-500/20 mb-4">04</div>
              <h3 className="text-xl font-semibold text-white mb-3">Share & Connect</h3>
              <p className="text-gray-400">Publish your post and engage with the community through comments.</p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold text-center mb-12 bg-linear-to-r from-pink-400 to-orange-400 bg-clip-text text-transparent">
            Platform Features
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#2d2d2d] border border-gray-800 rounded-2xl p-8 hover:border-pink-500/50 transition-all">
              <div className="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center mb-4">
                <Image className="text-pink-400" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Visual Storytelling</h3>
              <p className="text-gray-400">Select from our curated gallery or upload your own images to bring your stories to life.</p>
            </div>

            <div className="bg-[#2d2d2d] border border-gray-800 rounded-2xl p-8 hover:border-pink-500/50 transition-all">
              <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center mb-4">
                <MessageCircle className="text-orange-400" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Express Yourself</h3>
              <p className="text-gray-400">Write posts up to 150 words sharing your thoughts, experiences, and creative ideas.</p>
            </div>

            <div className="bg-[#2d2d2d] border border-gray-800 rounded-2xl p-8 hover:border-pink-500/50 transition-all">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-4">
                <Users className="text-purple-400" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Community Connection</h3>
              <p className="text-gray-400">Engage with others through comments, build relationships, and grow together.</p>
            </div>

            <div className="bg-[#2d2d2d] border border-gray-800 rounded-2xl p-8 hover:border-pink-500/50 transition-all">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4">
                <Heart className="text-blue-400" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Support & Appreciation</h3>
              <p className="text-gray-400">Show love for posts that inspire you with likes and meaningful feedback.</p>
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="bg-linear-to-br from-pink-500/10 to-orange-500/10 border border-pink-500/20 rounded-3xl p-12 mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Our Core Values</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-5xl mb-4">🎨</div>
              <h3 className="text-xl font-semibold text-white mb-2">Creativity</h3>
              <p className="text-gray-300">We celebrate unique perspectives and creative expression in all forms.</p>
            </div>
            
            <div className="text-center">
              <div className="text-5xl mb-4">🤝</div>
              <h3 className="text-xl font-semibold text-white mb-2">Community</h3>
              <p className="text-gray-300">Building genuine connections and supporting each other's growth.</p>
            </div>
            
            <div className="text-center">
              <div className="text-5xl mb-4">✨</div>
              <h3 className="text-xl font-semibold text-white mb-2">Simplicity</h3>
              <p className="text-gray-300">Making storytelling accessible and enjoyable for everyone.</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-[#2d2d2d] border border-gray-800 rounded-3xl p-12">
          <h2 className="text-4xl font-bold mb-4 bg-linear-to-r from-pink-400 to-orange-400 bg-clip-text text-transparent">
            Ready to Join Our Community?
          </h2>
          <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
            Start sharing your stories, connect with creative minds, and be part of something special.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/create"
              className="bg-linear-to-r from-pink-500 to-orange-500 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-2xl hover:shadow-pink-500/50 transition-all hover:scale-105"
            >
              Create Your First Post
            </Link>
            
            <Link
              to="/blog"
              className="border-2 border-pink-500/50 text-pink-400 px-8 py-4 rounded-xl font-semibold hover:bg-pink-500/10 hover:border-pink-500 transition-all"
            >
              Explore Community Feed
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

export default About;