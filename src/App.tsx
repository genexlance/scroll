import React, { useEffect, useState } from 'react';
import { ScrollAnimation } from './components/ScrollAnimation';
import { ChevronDown, Zap, Gauge, Puzzle, LogIn, Code, Layers, Users, Globe, Sparkles, Lock } from 'lucide-react';
import { FramesManager } from './components/Admin/FramesManager';
import { supabase } from './lib/supabase';

function App() {
  const [frames, setFrames] = useState<string[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFrames();
    checkAdmin();
  }, []);

  async function fetchFrames() {
    try {
      const { data, error } = await supabase
        .from('frames')
        .select('url')
        .eq('active', true)
        .order('order');
      
      if (error) throw error;
      setFrames(data.map(frame => frame.url));
    } catch (error) {
      console.error('Error fetching frames:', error);
    } finally {
      setLoading(false);
    }
  }

  async function checkAdmin() {
    const { data: { session } } = await supabase.auth.getSession();
    setIsAdmin(!!session);
  }

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (signInError) {
        setError('Invalid email or password');
        return;
      }
      
      setShowLoginForm(false);
      checkAdmin();
    } catch (error) {
      console.error('Error during authentication:', error);
      setError('An unexpected error occurred. Please try again.');
    }
  }

  function resetForm() {
    setShowLoginForm(false);
    setEmail('');
    setPassword('');
    setError('');
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
    </div>;
  }

  if (isAdmin) {
    return <FramesManager onFramesUpdate={fetchFrames} />;
  }

  return (
    <div className="relative">
      <div className="fixed inset-0 w-full h-full">
        <ScrollAnimation frames={frames} className="w-full h-full" />
      </div>

      <div className="relative">
        <div className="fixed top-4 right-4 z-50">
          {!showLoginForm ? (
            <button
              onClick={() => setShowLoginForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded hover:bg-gray-800/90 shadow-lg"
            >
              <LogIn className="w-5 h-5" />
              Admin Login
            </button>
          ) : (
            <div className="bg-white p-6 rounded-lg shadow-lg min-w-[320px]">
              <h3 className="text-xl font-bold mb-4">Admin Login</h3>
              <form onSubmit={handleAuth} className="flex flex-col gap-3">
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded text-sm w-full"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded text-sm w-full"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-black text-white rounded text-sm hover:bg-gray-800/90"
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                </div>
                {error && (
                  <div className="text-sm text-red-600">
                    {error}
                  </div>
                )}
              </form>
            </div>
          )}
        </div>

        <div className="min-h-screen relative flex flex-col items-center justify-center p-4 md:p-8">
          <h1 className="text-5xl md:text-7xl lg:text-[10rem] font-black text-center mb-8 text-gray-900 leading-none tracking-tighter">
            Welcome to<br />the Future
          </h1>
          <p className="text-xl md:text-2xl lg:text-3xl text-center max-w-3xl mb-12 text-gray-800 font-medium px-4 md:px-8">
            Scroll down to experience our innovative journey through dynamic visuals
          </p>
          <ChevronDown className="animate-bounce w-12 h-12 md:w-16 md:h-16 absolute bottom-12 text-gray-900" />
        </div>

        <section className="relative geometric-pattern text-white">
          <div className="max-w-6xl mx-auto py-20 md:py-32 px-4 md:px-8">
            <h2 className="text-4xl md:text-6xl lg:text-[8rem] font-black mb-8 md:mb-12 tracking-tighter leading-none">
              Our Vision for<br />Tomorrow
            </h2>
            <p className="text-xl md:text-2xl lg:text-3xl mb-8 leading-relaxed font-medium">
              We believe in creating experiences that push the boundaries of digital interaction.
              Through innovative design and cutting-edge technology, we're redefining what's possible
              on the web.
            </p>
            <p className="text-xl md:text-2xl lg:text-3xl leading-relaxed font-medium">
              Our scroll-based animations are just the beginning. We're constantly exploring new ways
              to make the web more engaging, more interactive, and more beautiful.
            </p>
          </div>
        </section>

        <section className="relative py-20 md:py-40 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl md:text-6xl lg:text-[7rem] font-black mb-12 md:mb-24 text-gray-900 text-center tracking-tighter">
              How It Works
            </h2>
            <div className="grid gap-8 md:gap-16 md:grid-cols-3">
              <div className="p-6 md:p-12">
                <Zap className="w-16 h-16 md:w-20 md:h-20 mb-8 text-gray-900" />
                <h3 className="text-2xl md:text-4xl font-black mb-6 md:mb-8 text-gray-900 tracking-tight">Smooth Transitions</h3>
                <p className="text-lg md:text-2xl text-gray-900">
                  Our animation system provides butter-smooth transitions between frames as you scroll.
                </p>
              </div>
              <div className="p-6 md:p-12">
                <Gauge className="w-16 h-16 md:w-20 md:h-20 mb-8 text-gray-900" />
                <h3 className="text-2xl md:text-4xl font-black mb-6 md:mb-8 text-gray-900 tracking-tight">Optimized Performance</h3>
                <p className="text-lg md:text-2xl text-gray-900">
                  Built with performance in mind, ensuring smooth scrolling on all devices.
                </p>
              </div>
              <div className="p-6 md:p-12">
                <Puzzle className="w-16 h-16 md:w-20 md:h-20 mb-8 text-gray-900" />
                <h3 className="text-2xl md:text-4xl font-black mb-6 md:mb-8 text-gray-900 tracking-tight">Easy Integration</h3>
                <p className="text-lg md:text-2xl text-gray-900">
                  Simple to implement and customize for your specific needs.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="relative geometric-pattern text-white">
          <div className="max-w-6xl mx-auto py-20 md:py-32 px-4 md:px-8">
            <h2 className="text-4xl md:text-6xl lg:text-[7rem] font-black mb-12 md:mb-24 tracking-tighter text-center">
              Built with Modern Tech
            </h2>
            <div className="grid gap-8 md:gap-16 grid-cols-2 md:grid-cols-4">
              <div className="text-center">
                <Code className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 md:mb-6" />
                <h3 className="text-xl md:text-2xl font-bold mb-2 md:mb-4">React</h3>
                <p className="text-gray-300">Powerful UI components</p>
              </div>
              <div className="text-center">
                <Layers className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 md:mb-6" />
                <h3 className="text-xl md:text-2xl font-bold mb-2 md:mb-4">Supabase</h3>
                <p className="text-gray-300">Reliable backend</p>
              </div>
              <div className="text-center">
                <Lock className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 md:mb-6" />
                <h3 className="text-xl md:text-2xl font-bold mb-2 md:mb-4">Security</h3>
                <p className="text-gray-300">Enterprise-grade</p>
              </div>
              <div className="text-center">
                <Sparkles className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 md:mb-6" />
                <h3 className="text-xl md:text-2xl font-bold mb-2 md:mb-4">Animation</h3>
                <p className="text-gray-300">Smooth transitions</p>
              </div>
            </div>
          </div>
        </section>

        <section className="relative py-20 md:py-40 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl md:text-6xl lg:text-[7rem] font-black mb-12 md:mb-24 text-gray-900 tracking-tighter text-center">
              Perfect For
            </h2>
            <div className="grid gap-8 md:gap-16 md:grid-cols-3">
              <div className="bg-white p-8 md:p-12 rounded-2xl shadow-xl">
                <Globe className="w-12 h-12 md:w-16 md:h-16 mb-6 md:mb-8 text-gray-900" />
                <h3 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-gray-900">Websites</h3>
                <p className="text-lg md:text-xl text-gray-700">
                  Create engaging landing pages and interactive web experiences that capture attention.
                </p>
              </div>
              <div className="bg-white p-8 md:p-12 rounded-2xl shadow-xl">
                <Users className="w-12 h-12 md:w-16 md:h-16 mb-6 md:mb-8 text-gray-900" />
                <h3 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-gray-900">Presentations</h3>
                <p className="text-lg md:text-xl text-gray-700">
                  Deliver impactful presentations with smooth transitions and engaging visuals.
                </p>
              </div>
              <div className="bg-white p-8 md:p-12 rounded-2xl shadow-xl">
                <Layers className="w-12 h-12 md:w-16 md:h-16 mb-6 md:mb-8 text-gray-900" />
                <h3 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-gray-900">Portfolios</h3>
                <p className="text-lg md:text-xl text-gray-700">
                  Showcase your work with style using our dynamic animation system.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="relative geometric-pattern-last text-white">
          <div className="max-w-4xl mx-auto py-20 md:py-32 px-4 md:px-8 text-center">
            <h2 className="text-4xl md:text-5xl lg:text-[6rem] font-black mb-8 md:mb-12 tracking-tighter">
              Ready to Get Started?
            </h2>
            <p className="text-xl md:text-2xl lg:text-3xl mb-8 md:mb-12 leading-relaxed">
              Join us in creating the next generation of web experiences.
            </p>
            <button className="px-8 md:px-12 py-4 md:py-6 bg-white text-black text-xl md:text-2xl font-bold rounded-lg hover:bg-gray-100 transition-colors">
              Contact Us
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

export default App;