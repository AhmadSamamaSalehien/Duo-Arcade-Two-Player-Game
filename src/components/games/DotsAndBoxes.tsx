import React, { useState, useEffect, useCallback } from 'react';
import { PlayerId, GameSettings } from '../../types';
import { getDotsAndBoxesMove, LineKey } from '../../lib/ai';
import { sounds } from '../../lib/sound';

interface DotsAndBoxesProps {
  settings: GameSettings;
  onFinishGame: (winner: PlayerId | 'draw') => void;
}

const GRID_SIZE = 4; // 4x4 dots -> 3x3 = 9 boxes

export const DotsAndBoxes: React.FC<DotsAndBoxesProps> = ({ settings, onFinishGame }) => {
  // Horizontal lines: (GRID_SIZE + 1) rows x GRID_SIZE cols
  const [hLines, setHLines] = useState<boolean[][]>(
    Array(GRID_SIZE + 1).fill(false).map(() => Array(GRID_SIZE).fill(false))
  );

  // Vertical lines: GRID_SIZE rows x (GRID_SIZE + 1) cols
  const [vLines, setVLines] = useState<boolean[][]>(
    Array(GRID_SIZE).fill(false).map(() => Array(GRID_SIZE + 1).fill(false))
  );

  // Boxes owner: GRID_SIZE rows x GRID_SIZE cols
  const [boxes, setBoxes] = useState<(PlayerId | null)[][]>(
    Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null))
  );

  const [currentPlayer, setCurrentPlayer] = useState<PlayerId>(settings.startingPlayer);
  const [p1Score, setP1Score] = useState<number>(0);
  const [p2Score, setP2Score] = useState<number>(0);
  const [winner, setWinner] = useState<PlayerId | 'draw' | null>(null);

  const handleLineClick = useCallback((line: LineKey) => {
    const { type, r, c } = line;

    // Already placed?
    if (type === 'h' && hLines[r][c]) return;
    if (type === 'v' && vLines[r][c]) return;
    if (winner !== null) return;

    sounds.playMove(currentPlayer === 1 ? 'red' : 'blue');

    const nextH = hLines.map((row) => [...row]);
    const nextV = vLines.map((row) => [...row]);

    if (type === 'h') nextH[r][c] = true;
    else nextV[r][c] = true;

    setHLines(nextH);
    setVLines(nextV);

    // Check newly closed boxes
    let boxesClaimed = 0;
    const nextBoxes = boxes.map((row) => [...row]);

    for (let br = 0; br < GRID_SIZE; br++) {
      for (let bc = 0; bc < GRID_SIZE; bc++) {
        if (nextBoxes[br][bc] === null) {
          const top = nextH[br][bc];
          const bottom = nextH[br + 1][bc];
          const left = nextV[br][bc];
          const right = nextV[br][bc + 1];

          if (top && bottom && left && right) {
            nextBoxes[br][bc] = currentPlayer;
            boxesClaimed++;
          }
        }
      }
    }

    let nextP1 = p1Score;
    let nextP2 = p2Score;

    if (boxesClaimed > 0) {
      sounds.playMatch();
      setBoxes(nextBoxes);
      if (currentPlayer === 1) {
        nextP1 += boxesClaimed;
        setP1Score(nextP1);
      } else {
        nextP2 += boxesClaimed;
        setP2Score(nextP2);
      }
    }

    // Check game over
    const totalBoxes = GRID_SIZE * GRID_SIZE;
    if (nextP1 + nextP2 === totalBoxes) {
      let finalWinner: PlayerId | 'draw' = 'draw';
      if (nextP1 > nextP2) finalWinner = 1;
      else if (nextP2 > nextP1) finalWinner = 2;

      setWinner(finalWinner);
      onFinishGame(finalWinner);
    } else if (boxesClaimed === 0) {
      // Switch player turn if no box claimed
      setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
    }
  }, [hLines, vLines, boxes, currentPlayer, p1Score, p2Score, winner, onFinishGame]);

  // Handle AI turn
  useEffect(() => {
    if (settings.mode === 'bot' && currentPlayer === 2 && winner === null) {
      const timer = setTimeout(() => {
        const botLine = getDotsAndBoxesMove(GRID_SIZE, hLines, vLines, settings.difficulty);
        if (botLine) {
          handleLineClick(botLine);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [hLines, vLines, currentPlayer, winner, settings, handleLineClick]);

  return (
    <div className="flex flex-col items-center justify-center space-y-6">
      {/* Box Score Summary Banner */}
      <div className="flex items-center gap-4 bg-white border-3 border-black p-3 rounded-2xl shadow-[4px_4px_0px_#000] font-black text-sm">
        <div className="flex items-center gap-1.5 text-red-600">
          <span className="w-3.5 h-3.5 rounded-full bg-red-600 border border-black inline-block"></span>
          <span>{settings.player1Name}: {p1Score} Boxes</span>
        </div>
        <span className="text-black font-extrabold">VS</span>
        <div className="flex items-center gap-1.5 text-blue-600">
          <span className="w-3.5 h-3.5 rounded-full bg-blue-600 border border-black inline-block"></span>
          <span>{settings.player2Name}: {p2Score} Boxes</span>
        </div>
      </div>

      {/* Dots and Lines Grid Container */}
      <div className="bg-[#FFE600] border-4 border-black p-6 rounded-3xl shadow-[8px_8px_0px_#000] max-w-md w-full">
        <div className="flex flex-col items-center justify-center space-y-1">
          {Array.from({ length: GRID_SIZE + 1 }).map((_, r) => (
            <React.Fragment key={`row-${r}`}>
              {/* Row of Dots & Horizontal Lines */}
              <div className="flex items-center">
                {Array.from({ length: GRID_SIZE + 1 }).map((_, c) => (
                  <React.Fragment key={`dot-${r}-${c}`}>
                    {/* Dot */}
                    <div className="w-5 h-5 rounded-full bg-black border-2 border-white shadow-[1px_1px_0px_#000] z-20"></div>

                    {/* Horizontal Line between (r, c) and (r, c+1) */}
                    {c < GRID_SIZE && (
                      <button
                        onClick={() => handleLineClick({ type: 'h', r, c })}
                        disabled={hLines[r][c] || winner !== null || (settings.mode === 'bot' && currentPlayer === 2)}
                        className={`w-14 sm:w-16 h-4 transition-all my-1 rounded-sm border-2 ${
                          hLines[r][c]
                            ? 'bg-black border-black shadow-[2px_2px_0px_#000]'
                            : 'bg-white/80 hover:bg-yellow-200 border-black/40 cursor-pointer'
                        }`}
                        title="Click horizontal line"
                      />
                    )}
                  </React.Fragment>
                ))}
              </div>

              {/* Row of Vertical Lines & Boxes */}
              {r < GRID_SIZE && (
                <div className="flex items-center">
                  {Array.from({ length: GRID_SIZE + 1 }).map((_, c) => (
                    <React.Fragment key={`vrow-${r}-${c}`}>
                      {/* Vertical Line between (r, c) and (r+1, c) */}
                      <button
                        onClick={() => handleLineClick({ type: 'v', r, c })}
                        disabled={vLines[r][c] || winner !== null || (settings.mode === 'bot' && currentPlayer === 2)}
                        className={`h-14 sm:h-16 w-4 transition-all mx-1 rounded-sm border-2 ${
                          vLines[r][c]
                            ? 'bg-black border-black shadow-[2px_2px_0px_#000]'
                            : 'bg-white/80 hover:bg-yellow-200 border-black/40 cursor-pointer'
                        }`}
                        title="Click vertical line"
                      />

                      {/* Box Interior */}
                      {c < GRID_SIZE && (
                        <div
                          className={`w-14 sm:w-16 h-14 sm:h-16 rounded-xl border-2 border-black/20 flex items-center justify-center font-black text-lg sm:text-xl transition-all ${
                            boxes[r][c] === 1
                              ? 'bg-red-500 text-white border-2 border-black shadow-[3px_3px_0px_#000] scale-95'
                              : boxes[r][c] === 2
                              ? 'bg-blue-600 text-white border-2 border-black shadow-[3px_3px_0px_#000] scale-95'
                              : 'bg-white/40'
                          }`}
                        >
                          {boxes[r][c] === 1 && 'RED'}
                          {boxes[r][c] === 2 && 'BLUE'}
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Rules Banner */}
      <div className="bg-amber-100 border-3 border-black p-3 rounded-xl max-w-md w-full text-center text-xs font-bold text-black shadow-[3px_3px_0px_#000]">
        💡 Click empty lines. Completing a 4-sided box claims it for your team and gives you an extra turn!
      </div>
    </div>
  );
};
