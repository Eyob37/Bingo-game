import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFirebase } from '../hooks/useFirebase';
import { Room } from '../types/game';
import { Trophy, Home, Users, RotateCcw } from 'lucide-react';

export const ResultsPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [room, setRoom] = useState<Room | null>(null);
  const [currentPlayerId, setCurrentPlayerId] = useState<string>('');
  const { subscribeToRoom, deleteRoom } = useFirebase();
  const navigate = useNavigate();

  useEffect(() => {
    if (!roomId) return;

    const playerId = localStorage.getItem('playerId');
    if (!playerId) {
      navigate('/');
      return;
    }

    setCurrentPlayerId(playerId);

    const unsubscribe = subscribeToRoom(roomId, (roomData) => {
      if (!roomData) {
        navigate('/');
        return;
      }
      setRoom(roomData);
    });

    return unsubscribe;
  }, [roomId, navigate, subscribeToRoom]);

  const handleDeleteRoom = async () => {
    if (room && room.hostId === currentPlayerId) {
      await deleteRoom(room.id);
    }
    navigate('/');
  };

  if (!room) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto mb-4"></div>
          <p className="text-xl">Loading results...</p>
        </div>
      </div>
    );
  }

  const winner = room.winner ? room.players[room.winner] : null;
  const sortedPlayers = Object.values(room.players).sort((a, b) => {
    if (a.isWinner) return -1;
    if (b.isWinner) return 1;
    return b.bingoLetters.length - a.bingoLetters.length;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 via-blue-600 to-purple-600">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <Trophy className="w-24 h-24 text-yellow-400 mx-auto mb-4" />
            <h1 className="text-5xl font-bold text-white mb-4">Game Results</h1>
            {winner && (
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <h2 className="text-3xl font-bold text-yellow-300 mb-2">
                  🎉 {winner.name} Wins! 🎉
                </h2>
                <p className="text-white/80 text-xl">
                  Completed BINGO with all 5 letters!
                </p>
              </div>
            )}
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/20">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">Final Standings</h3>
            <div className="space-y-4">
              {sortedPlayers.map((player, index) => (
                <div
                  key={player.id}
                  className={`flex items-center justify-between p-4 rounded-xl ${
                    player.isWinner 
                      ? 'bg-yellow-500/20 border-2 border-yellow-400' 
                      : 'bg-white/20'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg mr-4 ${
                      index === 0 ? 'bg-yellow-500 text-white' :
                      index === 1 ? 'bg-gray-400 text-white' :
                      index === 2 ? 'bg-orange-600 text-white' :
                      'bg-gray-600 text-white'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-white">{player.name}</h4>
                      {player.isWinner && (
                        <p className="text-yellow-300 font-semibold">Winner!</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      {['B', 'I', 'N', 'G', 'O'].map((letter) => (
                        <div
                          key={letter}
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                            player.bingoLetters.includes(letter)
                              ? 'bg-green-500'
                              : 'bg-gray-500'
                          }`}
                        >
                          {letter}
                        </div>
                      ))}
                    </div>
                    <span className="text-white font-semibold ml-4">
                      {player.bingoLetters.length}/5
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/')}
              className="bg-white/20 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/30 transition-colors flex items-center justify-center"
            >
              <Home className="w-5 h-5 mr-2" />
              Back to Home
            </button>
            
            <button
              onClick={() => navigate('/quick-play')}
              className="bg-blue-500 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-600 transition-colors flex items-center justify-center"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Play Again
            </button>

            {room.hostId === currentPlayerId && (
              <button
                onClick={handleDeleteRoom}
                className="bg-red-500 text-white px-8 py-4 rounded-xl font-semibold hover:bg-red-600 transition-colors flex items-center justify-center"
              >
                <Users className="w-5 h-5 mr-2" />
                Close Room
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};