import React, { useState, useEffect, useCallback } from 'react';
import { PlayerId, GameSettings } from '../../types';
import { getConnectFourMove } from '../../lib/ai';
import { sounds } from '../../lib/sound';
import { ChevronDownIcon } from '@primer/octicons-react';

interface ConnectFourProps {
  settings: GameSettings;
  onFinishGame: (winner: PlayerId | 'draw') => void;
}

const ROWS = 6;
const COLS = 7;

export const ConnectFour: React.FC<ConnectFourProps> = ({ settings, onFinishGame }) => {
  const [grid, setGrid] = useState<(PlayerId | null)[][]>(
    Array(ROWS).fill(null).map(() => Array(COLS).fill(null))
  );
  const [currentPlayer, setCurrentPlayer] = useState<PlayerId>(settings.startingPlayer);
  const [winner, setWinner] = useState<PlayerId | 'draw' | null>(null);
  const [winningCells, setWinningCells] = useState<[number, number][] | null>(null);
  const [hoverCol, setHoverCol] = useState<number | null>(null);

  const checkWinner = (board: (PlayerId | null)[][], r: number, c: number, p: PlayerId) => {
    const directions = [
      [[0, 1], [0, -1]],   // Horizontal
      [[1, 0], [-1, 0]],   // Vertical
      [[1, 1], [-1, -1]],  // Diagonal \
      [[1, -1], [-1, 1]]   // Diagonal /
    ];

    for (const [d1, d2] of directions) {
      const cells: [number, number][] = [[r, c]];

      for (const [dr, dc] of [d1, d2]) {
        let nr = r + dr;
        let nc = c + dc;
        while (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && board[nr][nc] === p) {
          cells.push([nr, nc]);
          nr += dr;
          nc += dc;
        }
      }

      if (cells.length >= 4) {
        return { winner: p, cells };
      }
    }

    // Check draw
    if (board[0].every((cell) => cell !== null)) {
      return { winner: 'draw' as const, cells: null };
    }

    return null;
  };

  const handleDropToken = useCallback((col: number) => {
    if (winner !== null || grid[0][col] !== null) return;

    // Find lowest empty row in column
    let targetRow = -1;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (grid[r][col] === null) {
        targetRow = r;
        break;
      }
    }

    if (targetRow === -1) return;

    sounds.playDrop();

    const newGrid = grid.map((row) => [...row]);
    newGrid[targetRow][col] = currentPlayer;
    setGrid(newGrid);

    const result = checkWinner(newGrid, targetRow, col, currentPlayer);
    if (result) {
      setWinner(result.winner);
      setWinningCells(result.cells);
      onFinishGame(result.winner);
    } else {
      setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
    }
  }, [grid, currentPlayer, winner, onFinishGame]);

  // Handle AI turn
  useEffect(() => {
    if (settings.mode === 'bot' && currentPlayer === 2 && winner === null) {
      const timer = setTimeout(() => {
        const botCol = getConnectFourMove(grid, settings.difficulty, 2);
        handleDropToken(botCol);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [grid, currentPlayer, winner, settings, handleDropToken]);

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      {/* Column Hover Indicator Drop Buttons */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2 max-w-lg w-full px-2">
        {Array.from({ length: COLS }).map((_, c) => (
          <button
            key={c}
            onClick={() => handleDropToken(c)}
            onMouseEnter={() => setHoverCol(c)}
            onMouseLeave={() => setHoverCol(null)}
            disabled={winner !== null || grid[0][c] !== null || (settings.mode === 'bot' && currentPlayer === 2)}
            className={`neo-button py-2 rounded-xl flex items-center justify-center font-black transition-all ${
              hoverCol === c
                ? currentPlayer === 1
                  ? 'bg-red-500 text-white scale-105'
                  : 'bg-blue-600 text-white scale-105'
                : 'bg-amber-300 text-black hover:bg-amber-400'
            }`}
            title={`Drop token in column ${c + 1}`}
          >
            <ChevronDownIcon size={20} aria-label={`Drop token in column ${c + 1}`} />
          </button>
        ))}
      </div>

      {/* Vertical Connect 4 Grid */}
      <div className="bg-[#FFE600] border-4 border-black p-3 sm:p-4 rounded-3xl shadow-[8px_8px_0px_#000] max-w-lg w-full">
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2 bg-black p-2 sm:p-3 rounded-2xl border-3 border-black">
          {grid.map((row, r) =>
            row.map((cell, c) => {
              const isWinning = winningCells?.some(([wr, wc]) => wr === r && wc === c);

              return (
                <button
                  key={`${r}-${c}`}
                  onClick={() => handleDropToken(c)}
                  disabled={winner !== null || (settings.mode === 'bot' && currentPlayer === 2)}
                  className={`aspect-square rounded-full border-3 border-black flex items-center justify-center transition-all ${
                    cell === 1
                      ? 'bg-red-500 shadow-[2px_2px_0px_#000]'
                      : cell === 2
                      ? 'bg-blue-600 shadow-[2px_2px_0px_#000]'
                      : 'bg-[#FFFDF8] hover:bg-yellow-100'
                  } ${isWinning ? 'ring-4 ring-amber-300 scale-110 z-10 animate-bounce' : ''}`}
                >
                  {cell !== null && (
                    <div className="w-2.5 h-2.5 rounded-full bg-white/40 border border-black/30"></div>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Rules Banner */}
      <div className="bg-amber-100 border-3 border-black p-3 rounded-xl max-w-lg w-full text-center text-xs font-bold text-black shadow-[3px_3px_0px_#000]">
        💡 Drop tokens down the columns. First player to connect 4 in a row (horizontal, vertical, diagonal) wins!
      </div>
    </div>
  );
};
