import React from 'react';
import { 
  PeopleIcon, 
  CpuIcon, 
  TableIcon, 
  IssueOpenedIcon, 
  DotIcon, 
  FlameIcon, 
  StackIcon, 
  ZapIcon,
  PlayIcon,
  StarIcon,
  GearIcon,
  TrophyIcon
} from '@primer/octicons-react';
import { GameInfo, GameMode, Difficulty, PlayerId, GameSettings } from '../types';
import { GAMES_LIST } from '../lib/gamesData';

interface GameSelectorProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
  onSelectGame: (gameId: GameInfo['id']) => void;
  onOpenStats: () => void;
}

export const GameSelector: React.FC<GameSelectorProps> = ({
  settings,
  onUpdateSettings,
  onSelectGame,
  onOpenStats
}) => {

  const getOcticon = (iconName: string) => {
    switch (iconName) {
      case 'GridIcon':
      case 'TableIcon': return <TableIcon size={28} aria-label="TicTacToe Icon" />;
      case 'IssueOpenedIcon': return <IssueOpenedIcon size={28} aria-label="ConnectFour Icon" />;
      case 'DotIcon': return <DotIcon size={28} aria-label="DotsAndBoxes Icon" />;
      case 'FlameIcon': return <FlameIcon size={28} aria-label="Pong Icon" />;
      case 'StackIcon': return <StackIcon size={28} aria-label="Memory Icon" />;
      case 'ZapIcon': return <ZapIcon size={28} aria-label="Reflex Icon" />;
      default: return <TableIcon size={28} aria-label="Default Icon" />;
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Sidebar Controls - Match Mode & Difficulty */}
      <aside className="w-full lg:w-1/3 flex flex-col gap-6">
        {/* Match Mode Box */}
        <div className="bg-white border-[4px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 flex flex-col gap-4">
          <h2 className="text-2xl font-black uppercase underline decoration-4 underline-offset-4 tracking-tight">
            Match Mode
          </h2>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                onUpdateSettings({ 
                  mode: 'friend', 
                  player2Name: 'Player 2 (Blue)' 
                });
              }}
              className={`border-[4px] border-black p-3 font-black text-left shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all uppercase flex items-center justify-between ${
                settings.mode === 'friend'
                  ? 'bg-[#6BCB77] text-black'
                  : 'bg-white text-black hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <PeopleIcon size={20} aria-label="Friend Icon" />
                <span>FRIEND 2P</span>
              </div>
              {settings.mode === 'friend' && <span className="text-xs bg-black text-white px-2 py-0.5 font-bold">ACTIVE</span>}
            </button>

            <button
              onClick={() => {
                onUpdateSettings({ 
                  mode: 'bot', 
                  player2Name: `Bot (${settings.difficulty.toUpperCase()})` 
                });
              }}
              className={`border-[4px] border-black p-3 font-black text-left shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all uppercase flex items-center justify-between ${
                settings.mode === 'bot'
                  ? 'bg-[#4D96FF] text-white'
                  : 'bg-white text-black hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <CpuIcon size={20} aria-label="Bot Icon" />
                <span>BOT AI</span>
              </div>
              {settings.mode === 'bot' && <span className="text-xs bg-black text-white px-2 py-0.5 font-bold">ACTIVE</span>}
            </button>
          </div>
        </div>

        {/* Difficulty Box */}
        <div className="bg-white border-[4px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 flex flex-col gap-4 flex-1 justify-between">
          <div>
            <h2 className="text-2xl font-black uppercase underline decoration-4 underline-offset-4 tracking-tight mb-2">
              Difficulty
            </h2>
            <p className="text-xs font-bold text-gray-700 uppercase">Select AI opponent challenge tier:</p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 justify-between">
            <button
              disabled={settings.mode !== 'bot'}
              onClick={() => onUpdateSettings({ difficulty: 'easy', player2Name: 'Bot (EASY)' })}
              className={`flex-1 border-[4px] border-black p-3 font-black text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] uppercase transition-colors ${
                settings.mode !== 'bot'
                  ? 'opacity-40 bg-gray-200 text-gray-500 cursor-not-allowed'
                  : settings.difficulty === 'easy'
                  ? 'bg-[#4D96FF] text-white'
                  : 'bg-white text-black hover:bg-black hover:text-white'
              }`}
            >
              EASY
            </button>

            <button
              disabled={settings.mode !== 'bot'}
              onClick={() => onUpdateSettings({ difficulty: 'medium', player2Name: 'Bot (MEDIUM)' })}
              className={`flex-1 border-[4px] border-black p-3 font-black text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] uppercase transition-colors ${
                settings.mode !== 'bot'
                  ? 'opacity-40 bg-gray-200 text-gray-500 cursor-not-allowed'
                  : settings.difficulty === 'medium'
                  ? 'bg-[#FFD93D] text-black'
                  : 'bg-white text-black hover:bg-black hover:text-white'
              }`}
            >
              MEDIUM
            </button>

            <button
              disabled={settings.mode !== 'bot'}
              onClick={() => onUpdateSettings({ difficulty: 'hard', player2Name: 'Bot (HARD)' })}
              className={`flex-1 border-[4px] border-black p-3 font-black text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] uppercase transition-colors ${
                settings.mode !== 'bot'
                  ? 'opacity-40 bg-gray-200 text-gray-500 cursor-not-allowed'
                  : settings.difficulty === 'hard'
                  ? 'bg-[#FF6B6B] text-white'
                  : 'bg-white text-black hover:bg-black hover:text-white'
              }`}
            >
              HARD
            </button>
          </div>

          {/* First Turn Choice */}
          <div className="border-t-4 border-black pt-4 mt-2">
            <span className="block text-xs font-black uppercase mb-2">First Turn:</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onUpdateSettings({ startingPlayer: 1 })}
                className={`border-[3px] border-black p-2 text-xs font-black uppercase ${
                  settings.startingPlayer === 1 ? 'bg-[#FF6B6B] text-white' : 'bg-gray-100 text-black'
                }`}
              >
                P1 (RED)
              </button>
              <button
                onClick={() => onUpdateSettings({ startingPlayer: 2 })}
                className={`border-[3px] border-black p-2 text-xs font-black uppercase ${
                  settings.startingPlayer === 2 ? 'bg-[#4D96FF] text-white' : 'bg-gray-100 text-black'
                }`}
              >
                P2 (BLUE)
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Game Grid Arena */}
      <main className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {GAMES_LIST.map((game) => {
          return (
            <div
              key={game.id}
              onClick={() => onSelectGame(game.id)}
              className="bg-white border-[4px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-5 flex flex-col items-center justify-between gap-4 hover:bg-[#FF6B6B] group transition-all cursor-pointer relative"
            >
              {/* Category Tag */}
              <div className="w-full flex justify-between items-center">
                <span className="bg-black text-white text-[10px] font-black uppercase px-2 py-0.5">
                  {game.category}
                </span>
                <span className="text-xs font-black uppercase group-hover:text-white">
                  {game.bestFor}
                </span>
              </div>

              {/* Center Icon Block */}
              <div className="bg-black p-4 text-white group-hover:bg-white group-hover:text-black border-2 border-black transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                {getOcticon(game.iconName)}
              </div>

              {/* Game Title */}
              <div className="text-center">
                <h3 className="text-xl font-black uppercase tracking-tight group-hover:text-white">
                  {game.title}
                </h3>
                <p className="text-xs font-bold text-gray-600 group-hover:text-white/90 mt-1">
                  {game.tagline}
                </p>
              </div>

              {/* Action Trigger */}
              <button className="w-full bg-[#FFD93D] text-black border-[3px] border-black py-2 font-black uppercase text-xs shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] group-hover:bg-black group-hover:text-white group-hover:border-white transition-all flex items-center justify-center gap-1">
                <PlayIcon size={16} aria-label="Play Game" />
                <span>START MATCH</span>
              </button>
            </div>
          );
        })}
      </main>
    </div>
  );
};
