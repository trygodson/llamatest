import React, { useState } from 'react';
import { Lock, Mail, Eye, EyeOff, Shield, ArrowLeft, Scale, Sparkles, Zap } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { BASE_URL } from '../utils';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(BASE_URL + '/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      if (!response.ok) {
        throw new Error('Invalid credentials');
      }

      const data = await response.json();

      if (data.access_token) {
        localStorage.setItem('access_token', data.access_token);
        navigate('/app/dashboard');
      } else {
        throw new Error('No access token received');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Invalid username or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4">
      <div className="max-w-md mx-auto">
        {/* Back to Home */}
        <Link
          to="/"
          className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-6 transition-colors font-medium"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Chat
        </Link>

        <div className="bg-white rounded-2xl shadow-2xl border border-indigo-100 p-8 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full -translate-y-16 translate-x-16 opacity-50"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-pink-100 to-yellow-100 rounded-full translate-y-12 -translate-x-12 opacity-50"></div>

          <div className="relative text-center mb-8">
            {/* <div className="flex items-center justify-center mb-6">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 rounded-2xl mr-4 shadow-lg">
                <Scale className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                LexAI
              </h1>
            </div> */}

            <div className="bg-gradient-to-r from-emerald-400 to-teal-500 p-4 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Shield className="h-10 w-10 text-white" />
            </div>

            <h2 className="text-2xl font-bold text-gray-800 mb-3">🔐 Welcome Back!</h2>
            <p className="text-gray-600 mb-2">Sign in to unlock your AI legal superpowers</p>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <span>⚡ Instant access</span>
              <span>•</span>
              <span>🚀 Advanced features</span>
            </div>
          </div>

          {error && (
            <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 shadow-sm">
              <div className="flex items-center">
                <span className="text-red-500 mr-2">⚠️</span>
                {error}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
                👤 Username
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-indigo-400" />
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10 w-full border-2 border-indigo-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gradient-to-r from-white to-indigo-50 shadow-sm"
                  placeholder="Enter your username"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                🔑 Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-indigo-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 w-full border-2 border-indigo-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gradient-to-r from-white to-indigo-50 shadow-sm"
                  placeholder="Enter your password"
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-indigo-400 hover:text-indigo-600 transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 px-4 rounded-xl hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Signing In...
                </>
              ) : (
                <>
                  <span className="mr-2">🚀</span>
                  Sign In to Dashboard
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              New ?{' '}
              <Link to="/signup" className="text-indigo-600 hover:text-indigo-800 font-semibold transition-colors">
                🎯 Create Account
              </Link>
            </p>
          </div>

          {/* <div className="mt-8 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
            <div className="flex items-center mb-3">
              <Sparkles className="h-5 w-5 text-indigo-600 mr-2" />
              <h3 className="font-semibold text-indigo-800">🎉 Premium Features Await</h3>
            </div>
            <div className="grid grid-cols-1 gap-2 text-sm text-indigo-700">
              <div className="flex items-center">
                <span className="text-green-500 mr-2">✅</span>
                Advanced legal document analysis
              </div>
              <div className="flex items-center">
                <span className="text-green-500 mr-2">✅</span>
                Case law research & citations
              </div>
              <div className="flex items-center">
                <span className="text-green-500 mr-2">✅</span>
                Smart contract review assistant
              </div>
              <div className="flex items-center">
                <span className="text-green-500 mr-2">✅</span>
                Secure document vault
              </div>
            </div>
          </div> */}

          {/* Testimonial */}
          {/* <div className="mt-6 p-4 bg-white border-2 border-yellow-200 rounded-xl">
            <div className="flex items-center space-x-3">
              <img 
                src="https://images.pexels.com/photos/5668772/pexels-photo-5668772.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&fit=crop" 
                alt="Legal professional" 
                className="w-10 h-10 rounded-full border-2 border-yellow-300"
              />
              <div>
                <p className="text-sm text-gray-700 italic">"LexAI transformed our practice! 🌟"</p>
                <p className="text-xs text-gray-500">- Sarah Chen, Partner at Chen & Associates</p>
              </div>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default Login;
