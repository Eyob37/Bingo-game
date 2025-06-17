import React from 'react';
import { Player } from '../types/game';

interface BingoBoardProps {
  player: Player;
  selectedNumbers: number[];
  isCurrentTurn: boolean;
  onNumberSelect: (number: number) => void;
  isGameStarted: boolean;
}

export const BingoBoard: React.FC<BingoBoardProps> = ({
  player,
  selectedNumbers,
  isCurrentTurn,
  onNumberSelect,
  isGameStarted
}) => {
  const isNumberSelected = (number: number) => selectedNumbers.includes(number);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800">{player.name}</h3>
        <div className="flex space-x-1">
          {['B', 'I', 'N', 'G', 'O'].map((letter, index) => (
            <div
              key={letter}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                player.bingoLetters.includes(letter)
                  ? 'bg-green-500'
                  : 'bg-gray-300'
              }`}
            >
              {letter}
            </div>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-5 gap-2 mb-4">
        {player.board.map((row, rowIndex) =>
          row.map((number, colIndex) => (
            <button
              key={`${rowIndex}-${colIndex}`}
              onClick={() => isCurrentTurn && isGameStarted && onNumberSelect(number)}
              disabled={!isCurrentTurn || !isGameStarted || isNumberSelected(number)}
              className={`
                w-12 h-12 rounded-lg font-bold text-lg transition-all duration-200
                ${isNumberSelected(number)
                  ? 'bg-red-500 text-white shadow-lg scale-105'
                  : 'bg-blue-100 text-blue-800 hover:bg-blue-200 hover:scale-105'
                }
                ${isCurrentTurn && isGameStarted && !isNumberSelected(number)
                  ? 'cursor-pointer border-2 border-blue-400'
                  : 'cursor-not-allowed'
                }
              `}
            >
              {number}
            </button>
          ))
        )}
      </div>
      
      {isCurrentTurn && isGameStarted && (
        <div className="text-center text-green-600 font-semibold">
          Your Turn!
        </div>
      )}
    </div>
  );
};