import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PlayerId, GameSettings } from '../../types';
import { sounds } from '../../lib/sound';
import { ZapIcon, PlayIcon, AlertIcon } from '@primer/octicons-react';

interface ReflexDuelProps {
  settings: GameSettings;
  onFinishGame: (winner: PlayerId | 'draw') => void;
}

type SubGameMode = 'reflex' | 'tugofwar';

export const ReflexDuel: React.FC<ReflexDuelProps> = ({ settings, onFinishGame }) => {
  const [subMode, setSubMode] = useState<SubGameMode>('reflex');

  // Reflex state
  const [reflexStage, setReflexStage] = useState<'idle' | 'waiting' | 'ready' | 'finished'>('idle');
  const [p1ReactionTime, setP1ReactionTime] = useState<number | null>(null);
  const [p2ReactionTime, setP2ReactionTime] = useState<number | null>(null);
  const [faultPlayer, setFaultPlayer] = useState<PlayerId | null>(null);
  const [winner, setWinner] = useState<PlayerId | 'draw' | null>(null);

  const startTimeRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Tug of War state
  const [ropePosition, setRopePosition] = useState<number>(0); // -50 (Red Wins) to +50 (Blue Wins)

  // Start Reflex round
  const startReflexRound = () => {
    setReflexStage('waiting');
    setP1ReactionTime(null);
    setP2ReactionTime(null);
    setFaultPlayer(null);
    setWinner(null);
    sounds.playClick();

    // Random delay 2.5s - 5s
    const randomDelay = Math.floor(Math.random() * 2500) + 2500;
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      setReflexStage('ready');
      startTimeRef.current = Date.now();
      sounds.playReflexBeep();
    }, randomDelay);
  };

  const handleReflexTap = (player: PlayerId) => {
    if (reflexStage === 'waiting') {
      // False start!
      if (timerRef.current) clearTimeout(timerRef.current);
      setFaultPlayer(player);
      setReflexStage('finished');
      const otherPlayer = player === 1 ? 2 : 1;
      setWinner(otherPlayer);
      sounds.playDraw();
      onFinishGame(otherPlayer);
      return;
    }

    if (reflexStage === 'ready' && startTimeRef.current !== null) {
      const reaction = Date.now() - startTimeRef.current;
      sounds.playWin();

      if (player === 1) setP1ReactionTime(reaction);
      else setP2ReactionTime(reaction);

      setReflexStage('finished');
      setWinner(player);
      onFinishGame(player);
    }
  };

  // Bot reflex tap reaction
  useEffect(() => {
    if (settings.mode === 'bot' && reflexStage === 'ready' && startTimeRef.current !== null) {
      const botDelay = settings.difficulty === 'hard' ? 220 : settings.difficulty === 'medium' ? 360 : 550;
      const timer = setTimeout(() => {
        handleReflexTap(2);
      }, botDelay);
      return () => clearTimeout(timer);
    }
  }, [reflexStage, settings, handleReflexTap]);

  // Clean up timer
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Tug of War mashing
  const handleTugTap = useCallback((player: PlayerId) => {
    if (winner !== null) return;

    sounds.playClick();
    setRopePosition((prev) => {
      const delta = player === 1 ? -4 : 4;
      const next = prev + delta;

      if (next <= -40) {
        setWinner(1);
        onFinishGame(1);
        return -40;
      }
      if (next >= 40) {
        setWinner(2);
        onFinishGame(2);
        return 40;
      }
      return next;
    });
  }, [winner, onFinishGame]);

  // AI Tug of war button mashing interval
  useEffect(() => {
    if (subMode === 'tugofwar' && settings.mode === 'bot' && winner === null) {
      const intervalMs = settings.difficulty === 'hard' ? 140 : settings.difficulty === 'medium' ? 220 : 350;
      const interval = setInterval(() => {
        handleTugTap(2);
      }, intervalMs);

      return () => clearInterval(interval);
    }
  }, [subMode, settings, winner, handleTugTap]);

  return (
    <div className="flex flex-col items-center justify-center space-y-6 max-w-xl mx-auto w-full">
      {/* Sub-mode Selector Tabs */}
      <div className="flex bg-white border-3 border-black p-1.5 rounded-2xl shadow-[4px_4px_0px_#000] w-full max-w-md">
        <button
          onClick={() => {
            setSubMode('reflex');
            setWinner(null);
            setReflexStage('idle');
          }}
          className={`flex-1 neo-button py-2.5 rounded-xl font-black text-xs uppercase flex items-center justify-center gap-1.5 ${
            subMode === 'reflex'
              ? 'bg-[#FFE600] text-black shadow-[2px_2px_0px_#000]'
              : 'bg-transparent text-black'
          }`}
        >
          <ZapIcon size={16} aria-label="Reflex Mode Icon" />
          <span>LIGHTNING REFLEX</span>
        </button>

        <button
          onClick={() => {
            setSubMode('tugofwar');
            setWinner(null);
            setRopePosition(0);
          }}
          className={`flex-1 neo-button py-2.5 rounded-xl font-black text-xs uppercase flex items-center justify-center gap-1.5 ${
            subMode === 'tugofwar'
              ? 'bg-rose-400 text-black shadow-[2px_2px_0px_#000]'
              : 'bg-transparent text-black'
          }`}
        >
          <ZapIcon size={16} aria-label="Tug of War Icon" />
          <span>TUG OF WAR MASH</span>
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MODE 1: LIGHTNING REFLEX DANGER SIGNAL */}
      {/* ------------------------------------------------------------- */}
      {subMode === 'reflex' && (
        <div className="w-full space-y-4">
          {/* Signal Indicator Display Box */}
          <div
            className={`border-4 border-black p-8 sm:p-12 rounded-3xl text-center shadow-[8px_8px_0px_#000] transition-all ${
              reflexStage === 'ready'
                ? 'bg-emerald-400 text-black animate-pulse'
                : reflexStage === 'waiting'
                ? 'bg-amber-400 text-black'
                : 'bg-black text-[#FFE600]'
            }`}
          >
            {reflexStage === 'idle' && (
              <div>
                <h3 className="font-black text-2xl uppercase">LIGHTNING REFLEX TEST</h3>
                <p className="text-xs font-bold mt-1">Press Start, wait for screen to turn GREEN, then TAP FAST!</p>
                <button
                  onClick={startReflexRound}
                  className="mt-4 neo-button bg-[#FFE600] text-black font-black text-sm py-3 px-6 rounded-xl inline-flex items-center gap-2"
                >
                  <PlayIcon size={18} aria-label="Start Reflex Round" />
                  <span>START REFLEX TEST</span>
                </button>
              </div>
            )}

            {reflexStage === 'waiting' && (
              <div>
                <div className="text-4xl font-black uppercase tracking-widest animate-pulse">
                  GET READY...
                </div>
                <p className="text-xs font-extrabold mt-2 text-black/80">DO NOT TAP YET! WAIT FOR GREEN!</p>
              </div>
            )}

            {reflexStage === 'ready' && (
              <div>
                <div className="text-5xl sm:text-6xl font-black uppercase tracking-widest">
                  TAP NOW!!! ⚡
                </div>
              </div>
            )}

            {reflexStage === 'finished' && (
              <div>
                {faultPlayer ? (
                  <div>
                    <div className="flex justify-center text-rose-500 mb-2">
                      <AlertIcon size={40} aria-label="False Start Fault" />
                    </div>
                    <h3 className="font-black text-2xl text-white uppercase">FALSE START FAULT!</h3>
                    <p className="text-xs font-bold text-gray-300 mt-1">
                      {faultPlayer === 1 ? settings.player1Name : settings.player2Name} tapped before signal!
                    </p>
                  </div>
                ) : (
                  <div>
                    <h3 className="font-black text-3xl uppercase text-emerald-400">
                      {winner === 1 ? settings.player1Name : settings.player2Name} WON!
                    </h3>
                    <p className="text-sm font-black text-white mt-1">
                      Reaction Time: {p1ReactionTime || p2ReactionTime} ms
                    </p>
                  </div>
                )}

                <button
                  onClick={startReflexRound}
                  className="mt-4 neo-button bg-[#FFE600] text-black font-black text-xs py-2.5 px-5 rounded-xl inline-flex items-center gap-2"
                >
                  <span>AGAIN!</span>
                </button>
              </div>
            )}
          </div>

          {/* Action Tap Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleReflexTap(1)}
              disabled={reflexStage === 'idle' || reflexStage === 'finished'}
              className="neo-button bg-red-500 hover:bg-red-600 text-white font-black text-lg py-8 rounded-2xl shadow-[4px_4px_0px_#000] disabled:opacity-40"
            >
              RED TAP 🔴
            </button>

            <button
              onClick={() => handleReflexTap(2)}
              disabled={reflexStage === 'idle' || reflexStage === 'finished' || settings.mode === 'bot'}
              className="neo-button bg-blue-600 hover:bg-blue-700 text-white font-black text-lg py-8 rounded-2xl shadow-[4px_4px_0px_#000] disabled:opacity-40"
            >
              BLUE TAP 🔵
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODE 2: TUG OF WAR BUTTON MASHING */}
      {/* ------------------------------------------------------------- */}
      {subMode === 'tugofwar' && (
        <div className="w-full space-y-4">
          <div className="bg-white border-4 border-black p-6 rounded-3xl shadow-[8px_8px_0px_#000] text-center space-y-6">
            <h3 className="font-black text-2xl uppercase tracking-tight text-black">
              TUG OF WAR SPEED DUEL
            </h3>
            <p className="text-xs font-bold text-gray-700">
              Mash your tap button as fast as possible to pull the rope to your side!
            </p>

            {/* Rope Gauge Visualiser */}
            <div className="relative bg-gray-200 border-3 border-black h-12 rounded-2xl overflow-hidden shadow-[3px_3px_0px_#000] flex items-center">
              {/* Left Red Territory */}
              <div className="w-1/2 h-full bg-red-200 border-r-2 border-black/30"></div>
              {/* Right Blue Territory */}
              <div className="w-1/2 h-full bg-blue-200"></div>

              {/* Center Flag Knot Indicator */}
              <div
                className="absolute top-1 bottom-1 w-8 bg-black text-[#FFE600] rounded-xl border-2 border-white flex items-center justify-center font-black text-xs transition-all duration-75 shadow-[2px_2px_0px_#000]"
                style={{
                  left: `calc(50% + ${ropePosition}% - 16px)`
                }}
              >
                🚩
              </div>
            </div>

            {/* Position meters */}
            <div className="flex justify-between font-black text-xs">
              <span className="text-red-600">RED GOAL (&lt;- -40)</span>
              <span className="text-black">CENTER: {ropePosition}</span>
              <span className="text-blue-600">BLUE GOAL (+40 -&gt;)</span>
            </div>
          </div>

          {/* Mashing Tap Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleTugTap(1)}
              disabled={winner !== null}
              className="neo-button bg-red-500 hover:bg-red-600 active:scale-95 text-white font-black text-lg py-8 rounded-2xl shadow-[4px_4px_0px_#000] disabled:opacity-50"
            >
              MASH RED 🔴
            </button>

            <button
              onClick={() => handleTugTap(2)}
              disabled={winner !== null || settings.mode === 'bot'}
              className="neo-button bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-black text-lg py-8 rounded-2xl shadow-[4px_4px_0px_#000] disabled:opacity-50"
            >
              MASH BLUE 🔵
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
