import React, { useState, useEffect } from 'react';
import { ArrowRight, BarChart3, Brain, Shield, Zap } from 'lucide-react';
import AuthModal from './AuthModal';
import Footer from './Footer';
import { User } from '../types';

interface LandingPageProps {
  onEnterApp: (user?: User) => void;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  size: 'small' | 'medium' | 'large' | 'star';
  color: string;
  layer: number; // Different layers for depth
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp }) => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);

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

  // Generate particles on component mount
  useEffect(() => {
    const generateParticles = () => {
      const newParticles: Particle[] = [];
      const particleCount = 60;
      
      const colors = [
        'rgba(59, 130, 246, 0.4)', // blue-500
        'rgba(99, 102, 241, 0.35)', // indigo-500
        'rgba(139, 92, 246, 0.3)', // violet-500
        'rgba(168, 85, 247, 0.35)', // purple-500
        'rgba(236, 72, 153, 0.3)', // pink-500
        'rgba(147, 197, 253, 0.4)', // blue-300
        'rgba(165, 180, 252, 0.35)', // indigo-300
        'rgba(196, 181, 253, 0.3)', // violet-300
      ];

      const sizes: Array<'small' | 'medium' | 'large' | 'star'> = ['small', 'medium', 'large', 'star'];

      for (let i = 0; i < particleCount; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: sizes[Math.floor(Math.random() * sizes.length)],
          color: colors[Math.floor(Math.random() * colors.length)],
          layer: Math.floor(Math.random() * 3) + 1 // 1, 2, or 3 for different layers
        });
      }
      
      setParticles(newParticles);
    };

    generateParticles();
  }, []);

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
      {/* Enhanced synchronized background elements */}
      <div className="absolute inset-0">
        {/* Large background orbs - all moving together */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/8 rounded-full blur-3xl animate-background-flow" style={{ animationDuration: '20s' }}></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-slate-600/6 rounded-full blur-3xl animate-background-flow" style={{ animationDuration: '20s', animationDelay: '0s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-background-flow" style={{ animationDuration: '20s', animationDelay: '0s' }}></div>
        
        {/* Medium floating orbs - synchronized movement */}
        <div className="absolute top-1/3 right-1/3 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl animate-synchronized-drift" style={{ animationDuration: '25s' }}></div>
        <div className="absolute bottom-1/3 left-1/3 w-48 h-48 bg-purple-500/8 rounded-full blur-2xl animate-synchronized-drift" style={{ animationDuration: '25s', animationDelay: '0s' }}></div>
        
        {/* Orbiting elements - synchronized orbits */}
        <div className="absolute top-1/4 right-1/4 w-2 h-2">
          <div className="w-2 h-2 bg-blue-400/50 rounded-full animate-synchronized-orbit" style={{ animationDuration: '30s' }}></div>
        </div>
        <div className="absolute bottom-1/3 left-1/4 w-2 h-2">
          <div className="w-2 h-2 bg-indigo-400/50 rounded-full animate-synchronized-orbit" style={{ animationDuration: '30s', animationDelay: '0s' }}></div>
        </div>
        <div className="absolute top-2/3 right-1/2 w-2 h-2">
          <div className="w-2 h-2 bg-violet-400/50 rounded-full animate-synchronized-orbit" style={{ animationDuration: '30s', animationDelay: '0s' }}></div>
        </div>
      </div>

      {/* Synchronized particle system - all particles move together */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Layer 1 - Wave flow particles */}
        {particles.filter(p => p.layer === 1).map((particle) => (
          <div
            key={`layer1-${particle.id}`}
            className={`absolute ${particle.size === 'star' ? 'particle-star' : `particle-${particle.size}`} animate-wave-flow`}
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              backgroundColor: particle.color,
              animationDuration: '18s',
              animationDelay: '0s',
              filter: particle.size === 'star' ? 'drop-shadow(0 0 3px currentColor)' : 'none'
            }}
          ></div>
        ))}

        {/* Layer 2 - Synchronized drift particles */}
        {particles.filter(p => p.layer === 2).map((particle) => (
          <div
            key={`layer2-${particle.id}`}
            className={`absolute ${particle.size === 'star' ? 'particle-star' : `particle-${particle.size}`} animate-synchronized-drift`}
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              backgroundColor: particle.color,
              animationDuration: '22s',
              animationDelay: '0s',
              filter: particle.size === 'star' ? 'drop-shadow(0 0 3px currentColor)' : 'none'
            }}
          ></div>
        ))}

        {/* Layer 3 - Synchronized pulse particles */}
        {particles.filter(p => p.layer === 3).map((particle) => (
          <div
            key={`layer3-${particle.id}`}
            className={`absolute ${particle.size === 'star' ? 'particle-star' : `particle-${particle.size}`} animate-synchronized-pulse`}
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              backgroundColor: particle.color,
              animationDuration: '16s',
              animationDelay: '0s',
              filter: particle.size === 'star' ? 'drop-shadow(0 0 3px currentColor)' : 'none'
            }}
          ></div>
        ))}
      </div>

      {/* Synchronized floating geometric shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating triangles - all moving together */}
        <div 
          className="absolute w-0 h-0 animate-wave-flow opacity-30"
          style={{
            left: '15%',
            top: '20%',
            borderLeft: '8px solid transparent',
            borderRight: '8px solid transparent',
            borderBottom: '12px solid rgba(59, 130, 246, 0.4)',
            animationDuration: '18s',
            animationDelay: '0s'
          }}
        ></div>
        <div 
          className="absolute w-0 h-0 animate-synchronized-drift opacity-25"
          style={{
            right: '20%',
            top: '60%',
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderBottom: '9px solid rgba(139, 92, 246, 0.5)',
            animationDuration: '22s',
            animationDelay: '0s'
          }}
        ></div>
        <div 
          className="absolute w-0 h-0 animate-synchronized-pulse opacity-35"
          style={{
            left: '70%',
            bottom: '30%',
            borderLeft: '5px solid transparent',
            borderRight: '5px solid transparent',
            borderBottom: '8px solid rgba(168, 85, 247, 0.4)',
            animationDuration: '16s',
            animationDelay: '0s'
          }}
        ></div>

        {/* Floating squares - synchronized movement */}
        <div 
          className="absolute w-4 h-4 bg-blue-400/30 animate-wave-flow opacity-40 transform rotate-45"
          style={{
            left: '80%',
            top: '30%',
            animationDuration: '18s',
            animationDelay: '0s'
          }}
        ></div>
        <div 
          className="absolute w-3 h-3 bg-indigo-400/35 animate-synchronized-drift opacity-45 transform rotate-12"
          style={{
            left: '10%',
            top: '70%',
            animationDuration: '22s',
            animationDelay: '0s'
          }}
        ></div>
        <div 
          className="absolute w-2 h-2 bg-violet-400/40 animate-synchronized-pulse opacity-50 transform rotate-45"
          style={{
            right: '15%',
            bottom: '25%',
            animationDuration: '16s',
            animationDelay: '0s'
          }}
        ></div>

        {/* Floating lines - synchronized flow */}
        <div 
          className="absolute w-12 h-0.5 bg-gradient-to-r from-transparent via-blue-400/40 to-transparent animate-wave-flow opacity-50"
          style={{
            left: '25%',
            top: '45%',
            animationDuration: '18s',
            animationDelay: '0s'
          }}
        ></div>
        <div 
          className="absolute w-10 h-0.5 bg-gradient-to-r from-transparent via-purple-400/35 to-transparent animate-synchronized-drift opacity-45"
          style={{
            right: '30%',
            bottom: '40%',
            animationDuration: '22s',
            animationDelay: '0s'
          }}
        ></div>
        <div 
          className="absolute w-8 h-0.5 bg-gradient-to-r from-transparent via-indigo-400/40 to-transparent animate-synchronized-pulse opacity-55"
          style={{
            left: '60%',
            top: '25%',
            animationDuration: '16s',
            animationDelay: '0s'
          }}
        ></div>
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
              <div className="w-2 h-2 bg-green-400 rounded-full animate-synchronized-twinkle" style={{ animationDuration: '8s' }}></div>
              <span>100% Free</span>
            </span>
            <span className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-synchronized-twinkle" style={{ animationDuration: '8s', animationDelay: '0s' }}></div>
              <span>Secure & Private</span>
            </span>
            <span className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-synchronized-twinkle" style={{ animationDuration: '8s', animationDelay: '0s' }}></div>
              <span>No Ads</span>
            </span>
          </div>
        </div>
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