import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFirebase } from '../hooks/useFirebase';
import { Zap, ArrowLeft, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

export const QuickPlayPage: React.FC = () => {
  const [playerName, setPlayerName] = useState('');
  const [error, setError] = useState('');
  const [searching, setSearching] = useState(false);
  const { findQuickPlayRoom, createRoom, loading } = useFirebase();
  const navigate = useNavigate();

  const handleQuickPlay = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }

    setSearching(true);

    try {
      // First try to find an existing room
      const roomId = await findQuickPlayRoom(playerName.trim());
      
      if (roomId) {
        navigate(`/game/${roomId}`);
      } else {
        // No available room found, create a new one
        const newRoomId = await createRoom(playerName.trim(), 4);
        navigate(`/game/${newRoomId}`);
      }
    } catch (error: any) {
      setError(error.message || 'Failed to find or create game');
      setSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-600 via-orange-600 to-red-600">
      <div className="container mx-auto px-4 py-8">
        <Link
          to="/"
          className="inline-flex items-center text-white hover:text-white/80 transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Home
        </Link>

        <div className="max-w-md mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <div className="text-center mb-8">
              <Zap className="w-16 h-16 text-white mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-white mb-2">Quick Play</h1>
              <p className="text-white/80">Get matched with other players instantly</p>
            </div>

            {!searching ? (
              <form onSubmit={handleQuickPlay} className="space-y-6">
                <div>
                  <label className="block text-white font-semibold mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                    placeholder="Enter your name"
                    maxLength={20}
                  />
                </div>

                <div className="bg-white/20 rounded-xl p-4">
                  <div className="flex items-center mb-2">
                    <Users className="w-5 h-5 text-white mr-2" />
                    <span className="text-white font-semibold">Game Settings</span>
                  </div>
                  <ul className="text-white/80 text-sm space-y-1">
                    <li>• Up to 4 players maximum</li>
                    <li>• Standard 5×5 Bingo board</li>
                    <li>• First to complete B-I-N-G-O wins</li>
                  </ul>
                </div>

                {error && (
                  <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4">
                    <p className="text-white text-center">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-white text-gray-800 font-bold py-4 rounded-xl hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Starting Game...' : 'Start Quick Play'}
                </button>
              </form>
            ) : (
              <div className="text-center space-y-6">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto"></div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Finding Players...</h3>
                  <p className="text-white/80">
                    We're looking for available games or creating a new room for you.
                  </p>
                </div>
                <div className="bg-white/20 rounded-xl p-4">
                  <p className="text-white/80 text-sm">
                    If no games are found, we'll create a new room and wait for other players to join.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};