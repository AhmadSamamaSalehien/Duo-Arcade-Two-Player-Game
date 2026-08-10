import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { TrophyIcon, SyncIcon, HomeIcon, FlameIcon, SmileyIcon } from '@primer/octicons-react';
import { PlayerId, GameSettings } from '../types';
import { sounds } from '../lib/sound';

interface GameOverModalProps {
  winner: PlayerId | 'draw';
  gameTitle: string;
  settings: GameSettings;
  onRematch: () => void;
  onMenu: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  winner,
  gameTitle,
  settings,
  onRematch,
  onMenu
}) => {
  useEffect(() => {
    if (winner === 1 || winner === 2) {
      sounds.playWin();
      // Fire celebratory confetti!
      const isRed = winner === 1;
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: isRed ? ['#EF4444', '#DC2626', '#FFE600', '#000000'] : ['#3B82F6', '#2563EB', '#FFE600', '#000000']
      });
    } else {
      sounds.playDraw();
    }
  }, [winner]);

  const winnerName = winner === 1 
    ? settings.player1Name 
    : winner === 2 
    ? settings.player2Name 
    : 'DRAW MATCH';

  const isRedWin = winner === 1;
  const isBlueWin = winner === 2;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div 
        className={`w-full max-w-md border-4 border-black rounded-3xl p-6 sm:p-8 shadow-[10px_10px_0px_#000] text-center space-y-6 ${
          isRedWin 
            ? 'bg-red-500 text-white' 
            : isBlueWin 
            ? 'bg-blue-600 text-white' 
            : 'bg-[#FFE600] text-black'
        }`}
      >
        {/* Top Trophy Icon Badge */}
        <div className="inline-flex p-4 rounded-full border-4 border-black bg-white text-black shadow-[4px_4px_0px_#000] animate-bounce">
          {winner === 'draw' ? (
            <SmileyIcon size={48} aria-label="Draw Match Icon" />
          ) : (
            <TrophyIcon size={48} className={isRedWin ? 'text-red-600' : 'text-blue-600'} aria-label="Winner Trophy" />
          )}
        </div>

        {/* Victory Banner Title */}
        <div>
          <span className="bg-black text-white text-xs font-black px-3 py-1 rounded-md border border-black uppercase tracking-widest inline-block mb-2">
            {gameTitle.toUpperCase()}
          </span>

          {winner === 'draw' ? (
            <h2 className="font-black text-3xl sm:text-4xl uppercase tracking-tight text-black">
              IT'S A DRAW!
            </h2>
          ) : (
            <div>
              <h2 className="font-black text-3xl sm:text-4xl uppercase tracking-tight text-white drop-shadow-[2px_2px_0px_#000]">
                {winnerName} VICTORY!
              </h2>
              <p className="font-extrabold text-sm uppercase opacity-90 mt-1">
                {isRedWin ? 'RED PLAYER TOOK THE WIN!' : 'BLUE PLAYER TOOK THE WIN!'}
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-2 space-y-3">
          <button
            onClick={() => {
              sounds.playClick();
              onRematch();
            }}
            className="w-full neo-button bg-black text-[#FFE600] hover:bg-gray-900 font-black text-base py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 shadow-[4px_4px_0px_#fff]"
          >
            <SyncIcon size={20} aria-label="Rematch Icon" />
            <span>PLAY REMATCH</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              onMenu();
            }}
            className="w-full neo-button bg-white text-black hover:bg-gray-100 font-black text-base py-3 px-6 rounded-xl flex items-center justify-center gap-2 shadow-[4px_4px_0px_#000]"
          >
            <HomeIcon size={20} aria-label="Menu Icon" />
            <span>BACK TO GAMES MENU</span>
          </button>
        </div>
      </div>
    </div>
  );
};
