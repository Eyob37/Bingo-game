import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFirebase } from '../hooks/useFirebase';
import { BingoBoard } from '../components/BingoBoard';
import { Room } from '../types/game';
import { Copy, Users, Play, Crown, Trophy } from 'lucide-react';

export const GamePage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [room, setRoom] = useState<Room | null>(null);
  const [currentPlayerId, setCurrentPlayerId] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const { subscribeToRoom, updatePlayerReady, startGame, selectNumber, deleteRoom } = useFirebase();
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
      
      // Check if game ended
      if (roomData.gameEnded && roomData.winner) {
        setTimeout(() => {
          navigate(`/results/${roomId}`);
        }, 3000);
      }
    });

    return unsubscribe;
  }, [roomId, navigate, subscribeToRoom]);

  const handleCopyRoomId = () => {
    if (roomId) {
      navigator.clipboard.writeText(roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePlayerReady = async () => {
    if (!room || !currentPlayerId) return;
    
    const currentPlayer = room.players[currentPlayerId];
    await updatePlayerReady(room.id, currentPlayerId, !currentPlayer.isReady);
  };

  const handleStartGame = async () => {
    if (!room || room.hostId !== currentPlayerId) return;
    await startGame(room.id);
  };

  const handleNumberSelect = async (number: number) => {
    if (!room || !currentPlayerId) return;
    await selectNumber(room.id, currentPlayerId, number);
  };

  if (!room) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto mb-4"></div>
          <p className="text-xl">Loading game...</p>
        </div>
      </div>
    );
  }

  const currentPlayer = room.players[currentPlayerId];
  const allPlayersReady = Object.values(room.players).every(p => p.isReady);
  const isHost = room.hostId === currentPlayerId;
  const isCurrentTurn = room.currentTurn === currentPlayerId;

  if (room.gameEnded && room.winner) {
    const winner = room.players[room.winner];
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-600 to-blue-600 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center border border-white/20">
          <Trophy className="w-24 h-24 text-yellow-400 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-white mb-4">Game Over!</h1>
          <p className="text-2xl text-white mb-6">
            🎉 {winner.name} wins with BINGO! 🎉
          </p>
          <p className="text-white/80">Redirecting to results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-4">
      <div className="container mx-auto">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-white/20">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center bg-white/20 rounded-xl px-4 py-2">
                <Users className="w-5 h-5 text-white mr-2" />
                <span className="text-white font-mono text-lg">{room.id}</span>
                <button
                  onClick={handleCopyRoomId}
                  className="ml-2 p-1 hover:bg-white/20 rounded"
                >
                  <Copy className="w-4 h-4 text-white" />
                </button>
              </div>
              {copied && (
                <span className="text-green-300 text-sm">Copied!</span>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-white">
                {Object.keys(room.players).length}/{room.maxPlayers} Players
              </span>
              {isHost && (
                <Crown className="w-5 h-5 text-yellow-400" />
              )}
            </div>
          </div>
        </div>

        {!room.gameStarted ? (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-white/20">
              <h2 className="text-2xl font-bold text-white text-center mb-6">Waiting for Players</h2>
              
              <div className="space-y-4 mb-6">
                {Object.values(room.players).map((player) => (
                  <div
                    key={player.id}
                    className="flex items-center justify-between bg-white/20 rounded-xl p-4"
                  >
                    <div className="flex items-center">
                      {room.hostId === player.id && (
                        <Crown className="w-5 h-5 text-yellow-400 mr-2" />
                      )}
                      <span className="text-white font-semibold">{player.name}</span>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      player.isReady 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-500 text-white'
                    }`}>
                      {player.isReady ? 'Ready' : 'Not Ready'}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-4">
                <button
                  onClick={handlePlayerReady}
                  className={`w-full py-3 rounded-xl font-semibold transition-colors ${
                    currentPlayer?.isReady
                      ? 'bg-gray-500 text-white hover:bg-gray-600'
                      : 'bg-green-500 text-white hover:bg-green-600'
                  }`}
                >
                  {currentPlayer?.isReady ? 'Cancel Ready' : 'Ready Up'}
                </button>

                {isHost && (
                  <button
                    onClick={handleStartGame}
                    disabled={!allPlayersReady || Object.keys(room.players).length < 2}
                    className="w-full bg-blue-500 text-white py-3 rounded-xl font-semibold hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Start Game
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-white mb-2">Bingo Game</h2>
              {room.currentTurn && (
                <p className="text-xl text-white/80">
                  Current Turn: <span className="font-semibold text-yellow-300">
                    {room.players[room.currentTurn]?.name}
                  </span>
                </p>
              )}
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Object.values(room.players).map((player) => (
                <BingoBoard
                  key={player.id}
                  player={player}
                  selectedNumbers={room.selectedNumbers}
                  isCurrentTurn={isCurrentTurn && player.id === currentPlayerId}
                  onNumberSelect={handleNumberSelect}
                  isGameStarted={room.gameStarted}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};