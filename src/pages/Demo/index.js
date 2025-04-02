import React from 'react';
import { Link } from 'react-router-dom';

export default function Demo() {
  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0e191d] via-[#1a2a2f] to-[#2a3a3f] opacity-90"></div>
        <div className="relative z-10 max-w-7xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-[#f64e07] to-[#0aa6d6]">
            See HoopTrackr In Action
          </h1>
          <p className="text-lg sm:text-xl text-gray-300 mb-12 text-center max-w-3xl mx-auto">
            Watch how easy it is to track games, manage teams, and analyze player performance with our intuitive interface.
          </p>

          {/* Feature Demos */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: 'Game Tracking',
                description: 'Track scores, stats, and player performance in real-time with our intuitive interface.',
                image: '/images/landing/game-tracking.png'
              },
              {
                title: 'Team Management',
                description: 'Create and manage teams, add players, and track team statistics all in one place.',
                image: '/images/landing/player_stats.png'
              },
              {
                title: 'Tournament Mode',
                description: 'Organize and run tournaments with automatic bracket generation and standings tracking.',
                image: '/images/landing/training-analytics.png'
              }
            ].map((feature, i) => (
              <div key={i} className="bg-gray-800 rounded-xl p-6 shadow-lg">
                <div className="aspect-video bg-gray-700 rounded-lg mb-4 overflow-hidden">
                  <img 
                    src={feature.image} 
                    alt={feature.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* CTA Section */}
          <div className="mt-16 text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Start Tracking?</h2>
            <Link
              to="/login"
              className="inline-block px-8 py-4 bg-[#f64e07] text-white font-bold rounded-lg shadow-lg hover:bg-[#d84307] transition-all transform hover:scale-105"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
} 