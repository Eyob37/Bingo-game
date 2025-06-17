import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Users, Zap, Trophy } from 'lucide-react';

export const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-teal-600">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <Home className="w-16 h-16 text-white mr-4" />
            <h1 className="text-6xl font-bold text-white">
              BINGO
            </h1>
          </div>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Experience the ultimate online multiplayer Bingo game! Create rooms, join friends, 
            or jump into quick matches with players worldwide.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Link
            to="/host"
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center hover:bg-white/20 transition-all duration-300 transform hover:scale-105 border border-white/20"
          >
            <Users className="w-16 h-16 text-white mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-3">Host Room</h3>
            <p className="text-white/80 leading-relaxed">
              Create your own Bingo room, invite friends with a room code, 
              and control the game settings.
            </p>
          </Link>

          <Link
            to="/join"
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center hover:bg-white/20 transition-all duration-300 transform hover:scale-105 border border-white/20"
          >
            <Trophy className="w-16 h-16 text-white mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-3">Join Room</h3>
            <p className="text-white/80 leading-relaxed">
              Have a room code? Join an existing game and compete 
              with other players for Bingo glory!
            </p>
          </Link>

          <Link
            to="/quick-play"
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center hover:bg-white/20 transition-all duration-300 transform hover:scale-105 border border-white/20"
          >
            <Zap className="w-16 h-16 text-white mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-3">Quick Play</h3>
            <p className="text-white/80 leading-relaxed">
              Jump straight into action! Get matched with other players 
              instantly for fast-paced Bingo fun.
            </p>
          </Link>
        </div>

        <div className="mt-16 bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-4xl mx-auto border border-white/20">
          <h2 className="text-3xl font-bold text-white text-center mb-6">How to Play</h2>
          <div className="grid md:grid-cols-2 gap-8 text-white/90">
            <div>
              <h4 className="text-xl font-semibold mb-3">Game Setup</h4>
              <ul className="space-y-2 leading-relaxed">
                <li>• Each player gets a 5×5 Bingo board with numbers 1-25</li>
                <li>• Numbers are randomly distributed on each board</li>
                <li>• Wait for all players to be ready</li>
              </ul>
            </div>
            <div>
              <h4 className="text-xl font-semibold mb-3">Gameplay</h4>
              <ul className="space-y-2 leading-relaxed">
                <li>• Players take turns selecting numbers</li>
                <li>• Selected numbers highlight on all boards</li>
                <li>• Complete rows, columns, or diagonals to earn B-I-N-G-O letters</li>
                <li>• First to collect all 5 letters wins!</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};