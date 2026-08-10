import React from 'react';
import { PersonIcon, CpuIcon, SyncIcon, HomeIcon, FlameIcon } from '@primer/octicons-react';
import { PlayerId, GameSettings } from '../types';

interface PlayerBarProps {
  currentPlayer: PlayerId;
  winner: PlayerId | 'draw' | null;
  gameTitle: string;
  settings: GameSettings;
  player1Score?: number;
  player2Score?: number;
  statusMessage?: string;
  onRestartGame: () => void;
  onBackToMenu: () => void;
}

export const PlayerBar: React.FC<PlayerBarProps> = ({
  currentPlayer,
  winner,
  gameTitle,
  settings,
  player1Score,
  player2Score,
  statusMessage,
  onRestartGame,
  onBackToMenu
}) => {
  const isP1Turn = currentPlayer === 1;
  const isP2Turn = currentPlayer === 2;

  return (
    <div className="bg-white border-[4px] border-black p-4 mb-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      {/* Top Header Row: Game Title & Quick Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b-4 border-black pb-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="bg-black text-[#FFD93D] text-xs font-black px-2.5 py-1 border-2 border-black uppercase tracking-wider">
            NOW PLAYING
          </span>
          <h2 className="font-black text-xl text-black uppercase tracking-tight flex items-center gap-1.5 italic">
            <FlameIcon size={20} className="text-[#FF6B6B]" aria-label="Game Flame Icon" />
            {gameTitle}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRestartGame}
            className="neo-button bg-[#FFD93D] hover:bg-yellow-400 text-black px-3 py-1.5 text-xs font-black flex items-center gap-1 uppercase"
          >
            <SyncIcon size={14} aria-label="Restart Icon" />
            <span>RESET GAME</span>
          </button>
          <button
            onClick={onBackToMenu}
            className="neo-button bg-white hover:bg-gray-100 text-black px-3 py-1.5 text-xs font-black flex items-center gap-1 uppercase"
          >
            <HomeIcon size={14} aria-label="Menu Icon" />
            <span>EXIT MENU</span>
          </button>
        </div>
      </div>

      {/* Players Turn Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Player 1 (RED) */}
        <div
          className={`p-3.5 border-[4px] border-black transition-all flex items-center justify-between ${
            isP1Turn && !winner
              ? 'bg-[#FF6B6B] text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] scale-[1.02]'
              : 'bg-red-50 text-black opacity-80'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black text-white border-2 border-white flex items-center justify-center font-black shadow-[2px_2px_0px_#000]">
              <PersonIcon size={20} aria-label="Player 1 Avatar" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-base uppercase tracking-wide">
                  {settings.player1Name}
                </span>
                <span className="bg-black text-white text-[10px] font-black px-1.5 py-0.5 border border-black uppercase">
                  P1: RED
                </span>
              </div>
              <p className={`text-xs font-bold ${isP1Turn && !winner ? 'text-white' : 'text-gray-700'}`}>
                {isP1Turn && !winner ? '👉 YOUR TURN!' : 'Waiting...'}
              </p>
            </div>
          </div>

          {player1Score !== undefined && (
            <div className="bg-white text-black font-black text-2xl px-3 py-1 border-[3px] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              {player1Score}
            </div>
          )}
        </div>

        {/* Player 2 / Bot (BLUE) */}
        <div
          className={`p-3.5 border-[4px] border-black transition-all flex items-center justify-between ${
            isP2Turn && !winner
              ? 'bg-[#4D96FF] text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] scale-[1.02]'
              : 'bg-blue-50 text-black opacity-80'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black text-white border-2 border-white flex items-center justify-center font-black shadow-[2px_2px_0px_#000]">
              {settings.mode === 'bot' ? (
                <CpuIcon size={20} aria-label="Bot Avatar" />
              ) : (
                <PersonIcon size={20} aria-label="Player 2 Avatar" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-base uppercase tracking-wide">
                  {settings.player2Name}
                </span>
                <span className="bg-black text-white text-[10px] font-black px-1.5 py-0.5 border border-black uppercase">
                  P2: BLUE
                </span>
              </div>
              <p className={`text-xs font-bold ${isP2Turn && !winner ? 'text-white' : 'text-gray-700'}`}>
                {isP2Turn && !winner ? (settings.mode === 'bot' ? '🤖 THINKING...' : '👉 YOUR TURN!') : 'Waiting...'}
              </p>
            </div>
          </div>

          {player2Score !== undefined && (
            <div className="bg-white text-black font-black text-2xl px-3 py-1 border-[3px] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              {player2Score}
            </div>
          )}
        </div>
      </div>

      {/* Optional Status Banner */}
      {statusMessage && (
        <div className="mt-4 bg-[#FFD93D] border-[3px] border-black p-2.5 text-center font-black text-xs text-black uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
          ⚡ {statusMessage}
        </div>
      )}
    </div>
  );
};
