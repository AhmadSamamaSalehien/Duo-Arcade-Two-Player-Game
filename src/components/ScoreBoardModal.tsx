import React from 'react';
import { 
  TrophyIcon, 
  XIcon, 
  GraphIcon, 
  HistoryIcon, 
  PersonIcon, 
  CpuIcon, 
  FlameIcon,
  SyncIcon
} from '@primer/octicons-react';
import { SessionStats, GameSettings } from '../types';

interface ScoreBoardModalProps {
  stats: SessionStats;
  settings: GameSettings;
  onClose: () => void;
  onResetStats: () => void;
}

export const ScoreBoardModal: React.FC<ScoreBoardModalProps> = ({
  stats,
  settings,
  onClose,
  onResetStats
}) => {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white border-4 border-black rounded-3xl p-6 sm:p-8 shadow-[10px_10px_0px_#000] space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b-3 border-black pb-3">
          <div className="flex items-center gap-2">
            <GraphIcon size={24} className="text-black" aria-label="Scoreboard Stats Icon" />
            <h2 className="font-black text-2xl text-black uppercase tracking-tight">
              SESSION LEADERBOARD
            </h2>
          </div>
          <button
            onClick={onClose}
            className="neo-button bg-rose-400 hover:bg-rose-500 text-black p-2 rounded-xl text-xs font-black"
          >
            <XIcon size={20} aria-label="Close Stats Modal" />
          </button>
        </div>

        {/* Win Count Cards */}
        <div className="grid grid-cols-3 gap-3 text-center">
          {/* Red Wins */}
          <div className="bg-red-500 text-white border-3 border-black p-4 rounded-2xl shadow-[4px_4px_0px_#000]">
            <div className="flex justify-center mb-1">
              <PersonIcon size={20} aria-label="Red Player Icon" />
            </div>
            <div className="font-black text-2xl sm:text-3xl">{stats.player1Wins}</div>
            <div className="font-extrabold text-[11px] uppercase tracking-wider text-red-100">
              {settings.player1Name.split(' ')[0]} WINS
            </div>
          </div>

          {/* Draws */}
          <div className="bg-[#FFE600] text-black border-3 border-black p-4 rounded-2xl shadow-[4px_4px_0px_#000]">
            <div className="flex justify-center mb-1">
              <TrophyIcon size={20} aria-label="Trophy Icon" />
            </div>
            <div className="font-black text-2xl sm:text-3xl">{stats.draws}</div>
            <div className="font-extrabold text-[11px] uppercase tracking-wider text-black/80">
              DRAWS
            </div>
          </div>

          {/* Blue Wins */}
          <div className="bg-blue-600 text-white border-3 border-black p-4 rounded-2xl shadow-[4px_4px_0px_#000]">
            <div className="flex justify-center mb-1">
              {settings.mode === 'bot' ? <CpuIcon size={20} aria-label="Bot Icon" /> : <PersonIcon size={20} aria-label="Blue Player Icon" />}
            </div>
            <div className="font-black text-2xl sm:text-3xl">{stats.player2Wins}</div>
            <div className="font-extrabold text-[11px] uppercase tracking-wider text-blue-100">
              {settings.player2Name.split(' ')[0]} WINS
            </div>
          </div>
        </div>

        {/* Current Streak */}
        {stats.currentStreakPlayer && stats.currentStreakCount > 0 && (
          <div className="bg-amber-100 border-3 border-black p-3 rounded-xl flex items-center justify-between font-black text-xs text-black shadow-[3px_3px_0px_#000]">
            <div className="flex items-center gap-2">
              <FlameIcon size={20} className="text-orange-600 animate-bounce" aria-label="Streak Flame Icon" />
              <span>CURRENT WIN STREAK</span>
            </div>
            <span className="bg-black text-[#FFE600] px-3 py-1 rounded-md text-sm border border-black">
              {stats.currentStreakPlayer === 1 ? settings.player1Name : settings.player2Name} ({stats.currentStreakCount} IN A ROW)
            </span>
          </div>
        )}

        {/* History List */}
        <div className="space-y-3">
          <h3 className="font-black text-sm uppercase tracking-wider text-black flex items-center gap-2">
            <HistoryIcon size={16} aria-label="Match History Icon" />
            <span>RECENT MATCHES</span>
          </h3>

          {stats.history.length === 0 ? (
            <p className="text-xs font-bold text-gray-500 text-center py-4 bg-gray-50 border-2 border-black rounded-xl">
              No matches played yet in this session. Go play a game!
            </p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {stats.history.slice().reverse().map((match, idx) => (
                <div
                  key={idx}
                  className="bg-gray-50 border-2 border-black p-2.5 rounded-xl flex items-center justify-between text-xs font-bold"
                >
                  <div className="flex items-center gap-2">
                    <span className="bg-black text-white px-2 py-0.5 rounded text-[10px] font-black uppercase">
                      {match.gameTitle}
                    </span>
                    <span className="text-gray-600">
                      ({match.mode === 'bot' ? `VS Bot ${match.difficulty || ''}` : '2P Local'})
                    </span>
                  </div>

                  <div>
                    {match.winner === 1 ? (
                      <span className="bg-red-500 text-white px-2 py-0.5 rounded border border-black font-black">
                        RED WON
                      </span>
                    ) : match.winner === 2 ? (
                      <span className="bg-blue-600 text-white px-2 py-0.5 rounded border border-black font-black">
                        BLUE WON
                      </span>
                    ) : (
                      <span className="bg-gray-300 text-black px-2 py-0.5 rounded border border-black font-black">
                        DRAW
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2 border-t-2 border-black">
          <button
            onClick={onResetStats}
            className="flex-1 neo-button bg-rose-200 hover:bg-rose-300 text-black font-black text-xs py-3 rounded-xl flex items-center justify-center gap-1.5"
          >
            <SyncIcon size={16} aria-label="Reset Leaderboard Icon" />
            <span>RESET ALL STATS</span>
          </button>
          <button
            onClick={onClose}
            className="flex-1 neo-button bg-black text-[#FFE600] font-black text-xs py-3 rounded-xl flex items-center justify-center"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
