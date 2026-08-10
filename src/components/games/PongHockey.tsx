import React, { useRef, useEffect, useState, useCallback } from 'react';
import { PlayerId, GameSettings } from '../../types';
import { sounds } from '../../lib/sound';
import { PlayIcon, SyncIcon } from '@primer/octicons-react';

interface PongHockeyProps {
  settings: GameSettings;
  onFinishGame: (winner: PlayerId | 'draw') => void;
}

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 380;
const PADDLE_WIDTH = 14;
const PADDLE_HEIGHT = 80;
const BALL_SIZE = 14;
const WINNING_SCORE = 5;

export const PongHockey: React.FC<PongHockeyProps> = ({ settings, onFinishGame }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [p1Score, setP1Score] = useState<number>(0);
  const [p2Score, setP2Score] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [winner, setWinner] = useState<PlayerId | null>(null);

  // Mutable game state inside refs to prevent state re-render drops during 60FPS loop
  const gameState = useRef({
    p1Y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
    p2Y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
    ballX: CANVAS_WIDTH / 2,
    ballY: CANVAS_HEIGHT / 2,
    ballVx: 4,
    ballVy: 3,
    keysPressed: {
      w: false,
      s: false,
      ArrowUp: false,
      ArrowDown: false
    }
  });

  const resetBall = useCallback((directionToP1: boolean) => {
    gameState.current.ballX = CANVAS_WIDTH / 2;
    gameState.current.ballY = CANVAS_HEIGHT / 2;
    const baseSpeed = 4.5;
    const angle = (Math.random() - 0.5) * 0.8;
    gameState.current.ballVx = (directionToP1 ? -1 : 1) * baseSpeed;
    gameState.current.ballVy = Math.sin(angle) * baseSpeed;
  }, []);

  const handleStartGame = () => {
    setP1Score(0);
    setP2Score(0);
    setWinner(null);
    resetBall(Math.random() < 0.5);
    setIsPlaying(true);
    sounds.playClick();
  };

  // On-Screen Controls for mobile/mouse mashing
  const moveP1 = (dir: 'up' | 'down') => {
    const speed = 25;
    gameState.current.p1Y = Math.max(0, Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, gameState.current.p1Y + (dir === 'up' ? -speed : speed)));
  };

  const moveP2 = (dir: 'up' | 'down') => {
    if (settings.mode === 'bot') return;
    const speed = 25;
    gameState.current.p2Y = Math.max(0, Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, gameState.current.p2Y + (dir === 'up' ? -speed : speed)));
  };

  // Keyboard Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['w', 'W'].includes(e.key)) gameState.current.keysPressed.w = true;
      if (['s', 'S'].includes(e.key)) gameState.current.keysPressed.s = true;
      if (e.key === 'ArrowUp') gameState.current.keysPressed.ArrowUp = true;
      if (e.key === 'ArrowDown') gameState.current.keysPressed.ArrowDown = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (['w', 'W'].includes(e.key)) gameState.current.keysPressed.w = false;
      if (['s', 'S'].includes(e.key)) gameState.current.keysPressed.s = false;
      if (e.key === 'ArrowUp') gameState.current.keysPressed.ArrowUp = false;
      if (e.key === 'ArrowDown') gameState.current.keysPressed.ArrowDown = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Main 60FPS Game Loop
  useEffect(() => {
    let animationFrameId: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const state = gameState.current;

      if (isPlaying && winner === null) {
        // 1. Move Player 1 Paddle
        const paddleSpeed = 6;
        if (state.keysPressed.w) state.p1Y = Math.max(0, state.p1Y - paddleSpeed);
        if (state.keysPressed.s) state.p1Y = Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, state.p1Y + paddleSpeed);

        // 2. Move Player 2 Paddle (Human or AI Bot)
        if (settings.mode === 'bot') {
          // AI Bot logic
          const botSpeed = settings.difficulty === 'hard' ? 5.5 : settings.difficulty === 'medium' ? 4 : 2.8;
          const paddleCenter = state.p2Y + PADDLE_HEIGHT / 2;
          if (paddleCenter < state.ballY - 12) {
            state.p2Y = Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, state.p2Y + botSpeed);
          } else if (paddleCenter > state.ballY + 12) {
            state.p2Y = Math.max(0, state.p2Y - botSpeed);
          }
        } else {
          // Human Player 2 (Arrow keys)
          if (state.keysPressed.ArrowUp) state.p2Y = Math.max(0, state.p2Y - paddleSpeed);
          if (state.keysPressed.ArrowDown) state.p2Y = Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, state.p2Y + paddleSpeed);
        }

        // 3. Move Ball
        state.ballX += state.ballVx;
        state.ballY += state.ballVy;

        // Bounce top & bottom wall
        if (state.ballY <= 0 || state.ballY >= CANVAS_HEIGHT - BALL_SIZE) {
          state.ballVy *= -1;
          sounds.playMove('red');
        }

        // Paddle 1 Collision (Left Red Paddle)
        if (
          state.ballX <= PADDLE_WIDTH + 15 &&
          state.ballY + BALL_SIZE >= state.p1Y &&
          state.ballY <= state.p1Y + PADDLE_HEIGHT &&
          state.ballVx < 0
        ) {
          state.ballVx = Math.abs(state.ballVx) * 1.05; // speed up slightly
          const hitSpot = (state.ballY + BALL_SIZE / 2 - (state.p1Y + PADDLE_HEIGHT / 2)) / (PADDLE_HEIGHT / 2);
          state.ballVy = hitSpot * 5;
          sounds.playMove('red');
        }

        // Paddle 2 Collision (Right Blue Paddle)
        if (
          state.ballX + BALL_SIZE >= CANVAS_WIDTH - PADDLE_WIDTH - 15 &&
          state.ballY + BALL_SIZE >= state.p2Y &&
          state.ballY <= state.p2Y + PADDLE_HEIGHT &&
          state.ballVx > 0
        ) {
          state.ballVx = -Math.abs(state.ballVx) * 1.05;
          const hitSpot = (state.ballY + BALL_SIZE / 2 - (state.p2Y + PADDLE_HEIGHT / 2)) / (PADDLE_HEIGHT / 2);
          state.ballVy = hitSpot * 5;
          sounds.playMove('blue');
        }

        // Goal Scored
        if (state.ballX < 0) {
          // Blue Scores
          sounds.playMatch();
          setP2Score((prev) => {
            const next = prev + 1;
            if (next >= WINNING_SCORE) {
              setWinner(2);
              setIsPlaying(false);
              onFinishGame(2);
            } else {
              resetBall(false);
            }
            return next;
          });
        } else if (state.ballX > CANVAS_WIDTH) {
          // Red Scores
          sounds.playMatch();
          setP1Score((prev) => {
            const next = prev + 1;
            if (next >= WINNING_SCORE) {
              setWinner(1);
              setIsPlaying(false);
              onFinishGame(1);
            } else {
              resetBall(true);
            }
            return next;
          });
        }
      }

      // DRAW CANVAS
      // Background
      ctx.fillStyle = '#FFFDF8';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Center Divider Line
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 4;
      ctx.setLineDash([12, 12]);
      ctx.beginPath();
      ctx.moveTo(CANVAS_WIDTH / 2, 0);
      ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw Paddles
      // Red Paddle Left
      ctx.fillStyle = '#EF4444';
      ctx.fillRect(15, state.p1Y, PADDLE_WIDTH, PADDLE_HEIGHT);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.strokeRect(15, state.p1Y, PADDLE_WIDTH, PADDLE_HEIGHT);

      // Blue Paddle Right
      ctx.fillStyle = '#2563EB';
      ctx.fillRect(CANVAS_WIDTH - PADDLE_WIDTH - 15, state.p2Y, PADDLE_WIDTH, PADDLE_HEIGHT);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.strokeRect(CANVAS_WIDTH - PADDLE_WIDTH - 15, state.p2Y, PADDLE_WIDTH, PADDLE_HEIGHT);

      // Draw Ball (Yellow puck)
      ctx.fillStyle = '#FFE600';
      ctx.fillRect(state.ballX, state.ballY, BALL_SIZE, BALL_SIZE);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.strokeRect(state.ballX, state.ballY, BALL_SIZE, BALL_SIZE);

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying, winner, settings, resetBall, onFinishGame]);

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      {/* Top Match Score Banner */}
      <div className="flex items-center gap-6 bg-white border-3 border-black px-6 py-2 rounded-2xl shadow-[4px_4px_0px_#000] font-black text-xl">
        <div className="text-red-600 flex items-center gap-2">
          <span className="w-4 h-4 rounded-full bg-red-600 border border-black inline-block"></span>
          <span>{settings.player1Name.split(' ')[0]}: {p1Score}</span>
        </div>
        <span className="text-black font-extrabold text-sm">FIRST TO {WINNING_SCORE}</span>
        <div className="text-blue-600 flex items-center gap-2">
          <span className="w-4 h-4 rounded-full bg-blue-600 border border-black inline-block"></span>
          <span>{settings.player2Name.split(' ')[0]}: {p2Score}</span>
        </div>
      </div>

      {/* HTML5 Canvas Game Stage */}
      <div className="relative bg-black p-3 rounded-3xl border-4 border-black shadow-[8px_8px_0px_#000]">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="rounded-2xl border-3 border-black w-full max-w-[600px] h-auto block"
        />

        {/* Start Game Overlay Button */}
        {!isPlaying && winner === null && (
          <div className="absolute inset-0 bg-black/60 rounded-3xl flex flex-col items-center justify-center p-4">
            <button
              onClick={handleStartGame}
              className="neo-button bg-[#FFE600] text-black font-black text-lg py-4 px-8 rounded-2xl flex items-center gap-3 shadow-[4px_4px_0px_#000] animate-bounce"
            >
              <PlayIcon size={24} aria-label="Start Arcade Pong Icon" />
              <span>START PONG MATCH</span>
            </button>
            <p className="text-white text-xs font-bold mt-3">
              Red Controls: W / S Keys • Blue Controls: Up / Down Arrows
            </p>
          </div>
        )}
      </div>

      {/* Touch / Mouse Onscreen Paddle Controls */}
      <div className="grid grid-cols-2 gap-4 max-w-lg w-full">
        {/* Red Player Onscreen Controls */}
        <div className="bg-red-500 border-3 border-black p-2.5 rounded-2xl text-white shadow-[3px_3px_0px_#000]">
          <div className="text-xs font-black uppercase text-center mb-1.5">RED PADDLE (W / S)</div>
          <div className="flex gap-2">
            <button
              onClick={() => moveP1('up')}
              className="flex-1 neo-button bg-white text-black font-black text-xs py-2 rounded-xl"
            >
              ⬆ UP
            </button>
            <button
              onClick={() => moveP1('down')}
              className="flex-1 neo-button bg-white text-black font-black text-xs py-2 rounded-xl"
            >
              ⬇ DOWN
            </button>
          </div>
        </div>

        {/* Blue Player Onscreen Controls */}
        <div className="bg-blue-600 border-3 border-black p-2.5 rounded-2xl text-white shadow-[3px_3px_0px_#000]">
          <div className="text-xs font-black uppercase text-center mb-1.5">BLUE PADDLE (UP / DOWN)</div>
          <div className="flex gap-2">
            <button
              disabled={settings.mode === 'bot'}
              onClick={() => moveP2('up')}
              className="flex-1 neo-button bg-white text-black font-black text-xs py-2 rounded-xl disabled:opacity-50"
            >
              ⬆ UP
            </button>
            <button
              disabled={settings.mode === 'bot'}
              onClick={() => moveP2('down')}
              className="flex-1 neo-button bg-white text-black font-black text-xs py-2 rounded-xl disabled:opacity-50"
            >
              ⬇ DOWN
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
