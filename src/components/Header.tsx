import React from 'react';
import { 
  TrophyIcon, 
  MuteIcon, 
  UnmuteIcon, 
  GraphIcon, 
  SyncIcon, 
  HomeIcon,
  PeopleIcon,
  CpuIcon
} from '@primer/octicons-react';
import { GameSettings, SessionStats, GameId } from '../types';
import { sounds } from '../lib/sound';

interface HeaderProps {
  activeGameId: GameId | null;
  settings: GameSettings;
  stats: SessionStats;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
  onOpenStats: () => void;
  onGoHome: () => void;
  onResetStats: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeGameId,
  settings,
  stats,
  onUpdateSettings,
  onOpenStats,
  onGoHome,
  onResetStats
}) => {
  const toggleSound = () => {
    const next = !settings.soundEnabled;
    sounds.enabled = next;
    onUpdateSettings({ soundEnabled: next });
    if (next) sounds.playClick();
  };

  return (
    <header className="bg-white border-b-4 border-black p-4 sticky top-0 z-40 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={onGoHome}>
          <div className="bg-black p-2.5 text-white border-2 border-black shadow-[2px_2px_0px_#000]">
            <TrophyIcon size={26} aria-label="App Logo Trophy Icon" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-4xl font-black italic tracking-tighter uppercase text-black flex items-center gap-2">
              DUO ARCADE <span className="bg-[#FF6B6B] text-white text-xs px-2 py-0.5 border-2 border-black not-italic -rotate-2 shadow-[2px_2px_0px_#000]">2P</span>
            </h1>
          </div>
        </div>

        {/* Player Stats Badges in Header */}
        <div className="flex items-center gap-3">
          <div className="border-[4px] border-black bg-[#FF6B6B] px-4 py-1.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2 text-white">
            <div className="w-3.5 h-3.5 rounded-full bg-white animate-pulse"></div>
            <span className="font-black uppercase text-sm sm:text-base tracking-wider">
              P1: {stats.player1Wins} WINS
            </span>
          </div>
          <div className="border-[4px] border-black bg-[#4D96FF] px-4 py-1.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2 text-white">
            <div className="w-3.5 h-3.5 rounded-full bg-white opacity-80"></div>
            <span className="font-black uppercase text-sm sm:text-base tracking-wider">
              P2: {stats.player2Wins} WINS
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Mode Indicator Badge */}
          <div className="hidden md:flex items-center gap-1.5 bg-[#6BCB77] text-black text-xs font-black px-3 py-2 border-[3px] border-black shadow-[3px_3px_0px_#000]">
            {settings.mode === 'friend' ? (
              <>
                <PeopleIcon size={16} aria-label="Friend Mode Icon" />
                <span className="uppercase tracking-wider">FRIEND MODE</span>
              </>
            ) : (
              <>
                <CpuIcon size={16} aria-label="Bot Mode Icon" />
                <span className="uppercase tracking-wider">BOT ({settings.difficulty})</span>
              </>
            )}
          </div>

          {/* Home Button if inside game */}
          {activeGameId && (
            <button
              onClick={onGoHome}
              title="Return to Game Menu"
              className="neo-button bg-white text-black p-2.5 font-black text-xs flex items-center gap-1.5 uppercase"
            >
              <HomeIcon size={18} aria-label="Home Icon" />
              <span className="hidden sm:inline">MENU</span>
            </button>
          )}

          {/* Stats Button */}
          <button
            onClick={onOpenStats}
            title="View Session Statistics"
            className="neo-button bg-[#FFD93D] text-black p-2.5 font-black text-xs flex items-center gap-1.5 uppercase"
          >
            <GraphIcon size={18} aria-label="Stats Icon" />
            <span className="hidden sm:inline">STATS</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            title={settings.soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
            className={`neo-button p-2.5 text-black font-black text-xs uppercase ${
              settings.soundEnabled ? 'bg-[#6BCB77]' : 'bg-gray-300'
            }`}
          >
            {settings.soundEnabled ? (
              <UnmuteIcon size={18} aria-label="Sound On" />
            ) : (
              <MuteIcon size={18} aria-label="Sound Off" />
            )}
          </button>

          {/* Reset Stats */}
          <button
            onClick={onResetStats}
            title="Reset Scoreboard"
            className="neo-button bg-[#FF6B6B] text-white p-2.5 text-xs font-black uppercase"
          >
            <SyncIcon size={18} aria-label="Reset Scoreboard" />
          </button>
        </div>
      </div>
    </header>
  );
};
