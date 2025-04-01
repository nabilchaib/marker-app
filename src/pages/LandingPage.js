import React from 'react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0e191d] via-[#1a2a2f] to-[#2a3a3f] opacity-90"></div>
        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#f64e07] to-[#0aa6d6]">
            Track Your Game, Elevate Your Play
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-8">
            The ultimate basketball companion for tracking games, drills, and player stats in real-time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/login"
              className="px-8 py-4 bg-[#f64e07] text-white font-bold rounded-lg shadow-lg hover:bg-[#d84307] transition-all transform hover:scale-105"
            >
              Get Started Free
            </Link>
            <Link
              to="/demo"
              className="px-8 py-4 bg-[#0aa6d6] text-white font-bold rounded-lg shadow-lg hover:bg-[#0989b3] transition-all transform hover:scale-105"
            >
              Watch Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="py-20 px-4 grid sm:grid-cols-2 gap-8 max-w-5xl mx-auto">
        <div className="bg-gray-800 p-6 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold text-orange-400 mb-2">🏀 Pickup Games</h2>
          <p className="text-md">Track full games with teams, scores, fouls, and player stats in real-time. Perfect for 3v3s, 5v5s, and local runs.</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold text-cyan-400 mb-2">🎯 Drills</h2>
          <p className="text-md">Focus on individual performance with shot tracking, make/miss rates, and session stats. Great for personal improvement or coaching.</p>
        </div>
      </section>

      {/* Screenshots Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-black/20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">See It In Action</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: 'Real-time Game Tracking',
                description: 'Track scores, stats, and player performance as it happens',
                image: '/images/landing/game-tracking.png'
              },
              {
                title: 'Detailed Player Stats',
                description: 'Get comprehensive insights into player performance',
                image: '/images/landing/player_stats.png'
              },
              {
                title: 'Training Analytics',
                description: 'Monitor your progress with detailed drill statistics',
                image: '/images/landing/training-analytics.png'
              }
            ].map((screenshot, i) => (
              <div key={i} className="relative group">
                <div className="aspect-video bg-gray-800 rounded-lg overflow-hidden">
                  <img 
                    src={screenshot.image} 
                    alt={screenshot.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex flex-col justify-end p-6">
                  <h3 className="text-white text-lg font-semibold mb-2">{screenshot.title}</h3>
                  <p className="text-gray-200 text-sm">{screenshot.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-12 bg-orange-600 text-center">
        <h4 className="text-2xl font-bold mb-4">Ready to Track Your Next Game?</h4>
        <Link to="/login" className="bg-white text-gray-900 font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-gray-100 transition">
          Try HoopTrackr Free
        </Link>
      </section>
    </div>
  );
}