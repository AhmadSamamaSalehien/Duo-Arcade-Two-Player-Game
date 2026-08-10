import React, { useState, useEffect } from 'react';
import { GameId, GameSettings, SessionStats, PlayerId } from './types';
import { GAMES_LIST } from './lib/gamesData';
import { Header } from './components/Header';
import { PlayerBar } from './components/PlayerBar';
import { GameSelector } from './components/GameSelector';
import { GameOverModal } from './components/GameOverModal';
import { ScoreBoardModal } from './components/ScoreBoardModal';

// Game Components
import { TicTacToe } from './components/games/TicTacToe';
import { ConnectFour } from './components/games/ConnectFour';
import { DotsAndBoxes } from './components/games/DotsAndBoxes';
import { PongHockey } from './components/games/PongHockey';
import { MemoryMatch } from './components/games/MemoryMatch';
import { ReflexDuel } from './components/games/ReflexDuel';

const SETTINGS_STORAGE_KEY = 'neobrutalist_2p_settings_v1';
const STATS_STORAGE_KEY = 'neobrutalist_2p_stats_v1';

const defaultSettings: GameSettings = {
  mode: 'friend',
  difficulty: 'medium',
  soundEnabled: true,
  startingPlayer: 1,
  player1Name: 'Player 1 (Red)',
  player2Name: 'Player 2 (Blue)'
};

const defaultStats: SessionStats = {
  gamesPlayed: 0,
  player1Wins: 0,
  player2Wins: 0,
  draws: 0,
  currentStreakPlayer: null,
  currentStreakCount: 0,
  history: []
};

export default function App() {
  const [activeGameId, setActiveGameId] = useState<GameId | null>(null);
  
  // Settings state
  const [settings, setSettings] = useState<GameSettings>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });

  // Session Stats state
  const [stats, setStats] = useState<SessionStats>(() => {
    try {
      const saved = localStorage.getItem(STATS_STORAGE_KEY);
      return saved ? { ...defaultStats, ...JSON.parse(saved) } : defaultStats;
    } catch {
      return defaultStats;
    }
  });

  const [currentPlayer, setCurrentPlayer] = useState<PlayerId>(settings.startingPlayer);
  const [activeWinner, setActiveWinner] = useState<PlayerId | 'draw' | null>(null);
  const [showStatsModal, setShowStatsModal] = useState<boolean>(false);
  const [gameKey, setGameKey] = useState<number>(0);

  // Sync settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }, [settings]);

  // Sync stats to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }, [stats]);

  const handleUpdateSettings = (newPartial: Partial<GameSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newPartial };
      if (newPartial.startingPlayer) {
        setCurrentPlayer(newPartial.startingPlayer);
      }
      return updated;
    });
  };

  const handleSelectGame = (gameId: GameId) => {
    setActiveGameId(gameId);
    setActiveWinner(null);
    setCurrentPlayer(settings.startingPlayer);
    setGameKey((k) => k + 1);
  };

  const handleFinishGame = (winnerResult: PlayerId | 'draw') => {
    setActiveWinner(winnerResult);

    const activeGameObj = GAMES_LIST.find((g) => g.id === activeGameId);
    const gameTitle = activeGameObj ? activeGameObj.title : 'Game';

    setStats((prev) => {
      let p1Wins = prev.player1Wins;
      let p2Wins = prev.player2Wins;
      let draws = prev.draws;
      let streakPlayer = prev.currentStreakPlayer;
      let streakCount = prev.currentStreakCount;

      if (winnerResult === 1) {
        p1Wins++;
        if (streakPlayer === 1) streakCount++;
        else {
          streakPlayer = 1;
          streakCount = 1;
        }
      } else if (winnerResult === 2) {
        p2Wins++;
        if (streakPlayer === 2) streakCount++;
        else {
          streakPlayer = 2;
          streakCount = 1;
        }
      } else {
        draws++;
        streakPlayer = null;
        streakCount = 0;
      }

      return {
        gamesPlayed: prev.gamesPlayed + 1,
        player1Wins: p1Wins,
        player2Wins: p2Wins,
        draws,
        currentStreakPlayer: streakPlayer,
        currentStreakCount: streakCount,
        history: [
          ...prev.history,
          {
            gameId: activeGameId || 'tictactoe',
            gameTitle,
            winner: winnerResult,
            mode: settings.mode,
            difficulty: settings.difficulty,
            timestamp: Date.now()
          }
        ]
      };
    });
  };

  const handleRestartGame = () => {
    setActiveWinner(null);
    setCurrentPlayer(settings.startingPlayer);
    setGameKey((k) => k + 1);
  };

  const handleResetStats = () => {
    setStats(defaultStats);
    try {
      localStorage.removeItem(STATS_STORAGE_KEY);
    } catch {}
  };

  const activeGameObj = GAMES_LIST.find((g) => g.id === activeGameId);

  return (
    <div className="min-h-screen bg-[#FFD93D] text-black border-[12px] border-black p-4 sm:p-6 flex flex-col font-sans gap-6">
      {/* Neobrutalist Navigation Header */}
      <Header
        activeGameId={activeGameId}
        settings={settings}
        stats={stats}
        onUpdateSettings={handleUpdateSettings}
        onOpenStats={() => setShowStatsModal(true)}
        onGoHome={() => setActiveGameId(null)}
        onResetStats={handleResetStats}
      />

      {/* Main Content Stage */}
      <main className="flex-1 w-full mx-auto">
        {!activeGameId ? (
          /* Game Selection Dashboard */
          <GameSelector
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onSelectGame={handleSelectGame}
            onOpenStats={() => setShowStatsModal(true)}
          />
        ) : (
          /* Active Game Playing Arena */
          <div className="max-w-4xl mx-auto">
            {/* Active Turn Banner */}
            <PlayerBar
              currentPlayer={currentPlayer}
              winner={activeWinner}
              gameTitle={activeGameObj ? activeGameObj.title : 'Game'}
              settings={settings}
              onRestartGame={handleRestartGame}
              onBackToMenu={() => setActiveGameId(null)}
            />

            {/* Render Selected Game */}
            <div key={gameKey} className="transition-all animate-fade-in">
              {activeGameId === 'tictactoe' && (
                <TicTacToe settings={settings} onFinishGame={handleFinishGame} />
              )}
              {activeGameId === 'connectfour' && (
                <ConnectFour settings={settings} onFinishGame={handleFinishGame} />
              )}
              {activeGameId === 'dotsandboxes' && (
                <DotsAndBoxes settings={settings} onFinishGame={handleFinishGame} />
              )}
              {activeGameId === 'pong' && (
                <PongHockey settings={settings} onFinishGame={handleFinishGame} />
              )}
              {activeGameId === 'memory' && (
                <MemoryMatch settings={settings} onFinishGame={handleFinishGame} />
              )}
              {activeGameId === 'reflex' && (
                <ReflexDuel settings={settings} onFinishGame={handleFinishGame} />
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer Branding */}
      <footer className="flex justify-center bg-black p-4 text-white border-[4px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex flex-wrap gap-6 items-center justify-between w-full max-w-6xl">
          <p className="font-black tracking-widest text-sm sm:text-base uppercase">READY TO START?</p>
          <button
            onClick={() => {
              if (activeGameId) handleRestartGame();
              else handleSelectGame('tictactoe');
            }}
            className="bg-[#FFD93D] text-black px-6 sm:px-10 py-2.5 border-[4px] border-white font-black uppercase text-base sm:text-xl hover:bg-white hover:text-black transition-all shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
          >
            START GAME
          </button>
          <p className="opacity-80 text-xs font-bold uppercase tracking-wider">DUO ARCADE STUDIO</p>
        </div>
      </footer>

      {/* Victory Celebration Modal */}
      {activeWinner && activeGameObj && (
        <GameOverModal
          winner={activeWinner}
          gameTitle={activeGameObj.title}
          settings={settings}
          onRematch={handleRestartGame}
          onMenu={() => setActiveGameId(null)}
        />
      )}

      {/* Scoreboard Stats Modal */}
      {showStatsModal && (
        <ScoreBoardModal
          stats={stats}
          settings={settings}
          onClose={() => setShowStatsModal(false)}
          onResetStats={handleResetStats}
        />
      )}
    </div>
  );
}
