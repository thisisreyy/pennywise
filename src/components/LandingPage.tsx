import React, { useState } from 'react';
import { ArrowRight, BarChart3, Brain, Shield, Zap } from 'lucide-react';
import AuthModal from './AuthModal';
import Footer from './Footer';
import { User } from '../types';

interface LandingPageProps {
  onEnterApp: (user?: User) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp }) => {
  const [showAuthModal, setShowAuthModal] = useState(false);

  const features = [
    {
      icon: BarChart3,
      title: 'Smart Analytics',
      description: 'Visualize your spending patterns with beautiful charts and insights'
    },
    {
      icon: Brain,
      title: 'AI-Powered Tips',
      description: 'Get personalized budget recommendations powered by machine learning'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your financial data stays private with encrypted local storage'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Track expenses instantly with our intuitive interface'
    }
  ];

  const handleGetStarted = () => {
    setShowAuthModal(true);
  };

  const handleAuthSuccess = (user: User) => {
    setShowAuthModal(false);
    onEnterApp(user);
  };

  const handleTryDemo = () => {
    onEnterApp(); // Enter without authentication for demo
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-blue-900 relative overflow-hidden flex flex-col">
      {/* Animated background elements - darker */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-slate-600/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/3 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-4 sm:px-6 lg:px-8 py-12">
        {/* Logo and Brand */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="mb-8 flex justify-center">
            <img 
              src="/logo.png" 
              alt="PennyWise Logo" 
              className="h-32 w-auto filter drop-shadow-2xl hover:scale-105 transition-transform duration-300"
            />
          </div>
          
          <p className="text-2xl md:text-3xl text-blue-200 font-light mb-4 tracking-wide">
            Track Smarter. Spend Wiser.
          </p>
          
          <p className="text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Transform your financial habits with AI-powered insights and beautiful analytics. 
            Take control of your money like never before.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="mb-16 animate-fade-in-delay flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleGetStarted}
            className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-slate-600 text-white font-semibold rounded-2xl text-lg shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105 hover:from-blue-500 hover:to-slate-500"
          >
            <span className="flex items-center space-x-3">
              <span>Get Started</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </span>
            
            {/* Animated border */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400 to-slate-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl"></div>
          </button>

          <button
            onClick={handleTryDemo}
            className="group relative px-8 py-4 bg-transparent border-2 border-gray-600 text-gray-300 font-semibold rounded-2xl text-lg hover:border-gray-500 hover:text-white transition-all duration-300 hover:scale-105"
          >
            <span className="flex items-center space-x-3">
              <span>Try Demo</span>
            </span>
          </button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto animate-fade-in-delay-2">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:border-blue-400/30"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-slate-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                
                <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-blue-200 transition-colors duration-300">
                  {feature.title}
                </h3>
                
                <p className="text-gray-400 text-sm leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Bottom tagline */}
        <div className="mt-16 text-center animate-fade-in-delay-3">
          <p className="text-gray-400 text-sm">
            Join thousands of users who've transformed their financial future
          </p>
          <div className="flex items-center justify-center space-x-6 mt-4 text-xs text-gray-500">
            <span className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>100% Free</span>
            </span>
            <span className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span>Secure & Private</span>
            </span>
            <span className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
              <span>No Ads</span>
            </span>
          </div>
        </div>
      </div>

      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${10 + Math.random() * 20}s`
            }}
          ></div>
        ))}
      </div>

      {/* Footer */}
      <Footer />

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
};

export default LandingPage;