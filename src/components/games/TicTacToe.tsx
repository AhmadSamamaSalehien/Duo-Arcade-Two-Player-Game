import React, { useState, useEffect, useCallback } from 'react';
import { PlayerId, GameSettings } from '../../types';
import { getTicTacToeMove } from '../../lib/ai';
import { sounds } from '../../lib/sound';
import { XIcon, CircleIcon } from '@primer/octicons-react';

interface TicTacToeProps {
  settings: GameSettings;
  onFinishGame: (winner: PlayerId | 'draw') => void;
}

export const TicTacToe: React.FC<TicTacToeProps> = ({ settings, onFinishGame }) => {
  const [board, setBoard] = useState<(PlayerId | null)[]>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<PlayerId>(settings.startingPlayer);
  const [winner, setWinner] = useState<PlayerId | 'draw' | null>(null);
  const [winningLine, setWinningLine] = useState<number[] | null>(null);

  const checkWinner = (grid: (PlayerId | null)[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];

    for (const [a, b, c] of lines) {
      if (grid[a] && grid[a] === grid[b] && grid[a] === grid[c]) {
        return { winner: grid[a]!, line: [a, b, c] };
      }
    }

    if (grid.every((cell) => cell !== null)) {
      return { winner: 'draw' as const, line: null };
    }

    return null;
  };

  const handleCellClick = useCallback((index: number) => {
    if (board[index] !== null || winner !== null) return;

    sounds.playMove(currentPlayer === 1 ? 'red' : 'blue');

    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);

    const result = checkWinner(newBoard);
    if (result) {
      setWinner(result.winner);
      setWinningLine(result.line);
      onFinishGame(result.winner);
    } else {
      setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
    }
  }, [board, currentPlayer, winner, onFinishGame]);

  // Handle AI turn
  useEffect(() => {
    if (settings.mode === 'bot' && currentPlayer === 2 && winner === null) {
      const timer = setTimeout(() => {
        const botMove = getTicTacToeMove(board, settings.difficulty, 2);
        if (botMove !== -1) {
          handleCellClick(botMove);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [board, currentPlayer, winner, settings, handleCellClick]);

  return (
    <div className="flex flex-col items-center justify-center space-y-6">
      {/* 3x3 Neobrutalist Board */}
      <div className="grid grid-cols-3 gap-3 p-4 bg-black rounded-3xl shadow-[8px_8px_0px_#000] border-4 border-black max-w-sm w-full">
        {board.map((cell, idx) => {
          const isWinningCell = winningLine?.includes(idx);

          return (
            <button
              key={idx}
              onClick={() => handleCellClick(idx)}
              disabled={cell !== null || winner !== null || (settings.mode === 'bot' && currentPlayer === 2)}
              className={`h-24 sm:h-28 rounded-2xl border-4 border-black font-black flex items-center justify-center transition-all neo-button ${
                cell === 1
                  ? 'bg-red-500 text-white shadow-[3px_3px_0px_#000]'
                  : cell === 2
                  ? 'bg-blue-600 text-white shadow-[3px_3px_0px_#000]'
                  : 'bg-[#FFFDF8] hover:bg-yellow-100 text-black shadow-[3px_3px_0px_#000]'
              } ${isWinningCell ? 'ring-4 ring-amber-400 scale-105 z-10 animate-pulse' : ''}`}
            >
              {cell === 1 && (
                <div className="animate-scale-in">
                  <XIcon size={44} className="stroke-[3]" aria-label="Red X Mark" />
                </div>
              )}
              {cell === 2 && (
                <div className="animate-scale-in">
                  <CircleIcon size={40} className="stroke-[3]" aria-label="Blue O Mark" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Rules Footer */}
      <div className="bg-amber-100 border-3 border-black p-3 rounded-xl max-w-sm w-full text-center text-xs font-bold text-black shadow-[3px_3px_0px_#000]">
        💡 Click any empty cell to place your symbol. First to get 3 in a line wins!
      </div>
    </div>
  );
};
