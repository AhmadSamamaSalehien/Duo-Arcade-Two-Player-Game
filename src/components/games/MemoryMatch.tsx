import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { PlayerId, GameSettings } from '../../types';
import { getMemoryBotFlip } from '../../lib/ai';
import { sounds } from '../../lib/sound';
import { 
  FlameIcon, 
  TrophyIcon, 
  StarIcon, 
  ZapIcon, 
  IssueOpenedIcon, 
  DotIcon, 
  SmileyIcon, 
  RocketIcon,
  QuestionIcon
} from '@primer/octicons-react';

interface MemoryMatchProps {
  settings: GameSettings;
  onFinishGame: (winner: PlayerId | 'draw') => void;
}

const OCTICON_PAIRS = [
  'FlameIcon', 'TrophyIcon', 'StarIcon', 'ZapIcon', 
  'IssueOpenedIcon', 'DotIcon', 'SmileyIcon', 'RocketIcon'
];

interface CardState {
  id: number;
  iconName: string;
  isFlipped: boolean;
  owner: PlayerId | null; // Claimed by Red or Blue
}

export const MemoryMatch: React.FC<MemoryMatchProps> = ({ settings, onFinishGame }) => {
  // Generate 16 shuffled cards (8 pairs)
  const initialCards = useMemo(() => {
    const doubleList = [...OCTICON_PAIRS, ...OCTICON_PAIRS];
    // Fisher-Yates shuffle
    for (let i = doubleList.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [doubleList[i], doubleList[j]] = [doubleList[j], doubleList[i]];
    }
    return doubleList.map((iconName, idx) => ({
      id: idx,
      iconName,
      isFlipped: false,
      owner: null
    }));
  }, []);

  const [cards, setCards] = useState<CardState[]>(initialCards);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<PlayerId>(settings.startingPlayer);
  const [p1Matches, setP1Matches] = useState<number>(0);
  const [p2Matches, setP2Matches] = useState<number>(0);
  const [memoryBank, setMemoryBank] = useState<Map<number, string>>(new Map());
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [winner, setWinner] = useState<PlayerId | 'draw' | null>(null);

  const renderOcticon = (iconName: string) => {
    switch (iconName) {
      case 'FlameIcon': return <FlameIcon size={32} className="text-amber-500" aria-label="Flame Icon" />;
      case 'TrophyIcon': return <TrophyIcon size={32} className="text-yellow-500" aria-label="Trophy Icon" />;
      case 'StarIcon': return <StarIcon size={32} className="text-amber-400" aria-label="Star Icon" />;
      case 'ZapIcon': return <ZapIcon size={32} className="text-orange-500" aria-label="Zap Icon" />;
      case 'IssueOpenedIcon': return <IssueOpenedIcon size={32} className="text-emerald-500" aria-label="Issue Icon" />;
      case 'DotIcon': return <DotIcon size={32} className="text-cyan-500" aria-label="Dot Icon" />;
      case 'SmileyIcon': return <SmileyIcon size={32} className="text-pink-500" aria-label="Smiley Icon" />;
      case 'RocketIcon': return <RocketIcon size={32} className="text-purple-500" aria-label="Rocket Icon" />;
      default: return <QuestionIcon size={32} aria-label="Question Mark" />;
    }
  };

  const handleCardClick = useCallback((index: number) => {
    if (
      isProcessing ||
      cards[index].isFlipped ||
      cards[index].owner !== null ||
      flippedIndices.includes(index) ||
      winner !== null
    ) {
      return;
    }

    sounds.playFlip();

    // Reveal card
    const nextFlipped = [...flippedIndices, index];
    setFlippedIndices(nextFlipped);

    // Save to memory bank for AI
    setMemoryBank((prev) => {
      const nextMap = new Map(prev);
      nextMap.set(index, cards[index].iconName);
      return nextMap;
    });

    // Check if 2 cards are flipped
    if (nextFlipped.length === 2) {
      setIsProcessing(true);
      const [idx1, idx2] = nextFlipped;

      if (cards[idx1].iconName === cards[idx2].iconName) {
        // MATCH!
        sounds.playMatch();
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c, i) =>
              i === idx1 || i === idx2
                ? { ...c, isFlipped: true, owner: currentPlayer }
                : c
            )
          );
          setFlippedIndices([]);
          setIsProcessing(false);

          let nextP1 = p1Matches;
          let nextP2 = p2Matches;

          if (currentPlayer === 1) {
            nextP1 += 1;
            setP1Matches(nextP1);
          } else {
            nextP2 += 1;
            setP2Matches(nextP2);
          }

          // Check if all 8 pairs found
          if (nextP1 + nextP2 === 8) {
            let finalWinner: PlayerId | 'draw' = 'draw';
            if (nextP1 > nextP2) finalWinner = 1;
            else if (nextP2 > nextP1) finalWinner = 2;

            setWinner(finalWinner);
            onFinishGame(finalWinner);
          }
          // Player retains turn on match!
        }, 600);
      } else {
        // NO MATCH -> Switch turn
        setTimeout(() => {
          setFlippedIndices([]);
          setIsProcessing(false);
          setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
        }, 1100);
      }
    }
  }, [cards, flippedIndices, isProcessing, currentPlayer, p1Matches, p2Matches, winner, onFinishGame]);

  // Handle AI turn
  useEffect(() => {
    if (settings.mode === 'bot' && currentPlayer === 2 && winner === null && !isProcessing) {
      const timer = setTimeout(() => {
        const unmatched = cards
          .map((c, i) => (c.owner === null ? i : null))
          .filter((i): i is number => i !== null);

        if (unmatched.length > 0) {
          const firstIndex = flippedIndices.length === 1 ? flippedIndices[0] : null;
          const botFlipIndex = getMemoryBotFlip(
            unmatched,
            memoryBank,
            firstIndex,
            settings.difficulty
          );
          handleCardClick(botFlipIndex);
        }
      }, 700);

      return () => clearTimeout(timer);
    }
  }, [cards, flippedIndices, currentPlayer, winner, isProcessing, settings, memoryBank, handleCardClick]);

  return (
    <div className="flex flex-col items-center justify-center space-y-6">
      {/* Matches Score Summary */}
      <div className="flex items-center gap-6 bg-white border-3 border-black px-6 py-2 rounded-2xl shadow-[4px_4px_0px_#000] font-black text-sm sm:text-base">
        <div className="text-red-600 flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-full bg-red-600 border border-black inline-block"></span>
          <span>{settings.player1Name}: {p1Matches} PAIRS</span>
        </div>
        <span className="text-black font-extrabold text-xs">8 PAIRS TOTAL</span>
        <div className="text-blue-600 flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-full bg-blue-600 border border-black inline-block"></span>
          <span>{settings.player2Name}: {p2Matches} PAIRS</span>
        </div>
      </div>

      {/* 4x4 Grid of Cards */}
      <div className="grid grid-cols-4 gap-3 bg-[#FFE600] border-4 border-black p-4 sm:p-6 rounded-3xl shadow-[8px_8px_0px_#000] max-w-md w-full">
        {cards.map((card, idx) => {
          const isFlippedNow = flippedIndices.includes(idx) || card.owner !== null;
          const isRedOwned = card.owner === 1;
          const isBlueOwned = card.owner === 2;

          return (
            <button
              key={card.id}
              onClick={() => handleCardClick(idx)}
              disabled={isFlippedNow || isProcessing || (settings.mode === 'bot' && currentPlayer === 2)}
              className={`h-20 sm:h-24 rounded-2xl border-3 border-black flex items-center justify-center font-black transition-all neo-button ${
                isRedOwned
                  ? 'bg-red-500 text-white shadow-[3px_3px_0px_#000]'
                  : isBlueOwned
                  ? 'bg-blue-600 text-white shadow-[3px_3px_0px_#000]'
                  : isFlippedNow
                  ? 'bg-white text-black shadow-[3px_3px_0px_#000]'
                  : 'bg-black text-[#FFE600] hover:bg-gray-900 shadow-[3px_3px_0px_#000]'
              }`}
            >
              {isFlippedNow ? (
                <div className="animate-scale-in">
                  {renderOcticon(card.iconName)}
                </div>
              ) : (
                <QuestionIcon size={28} className="text-[#FFE600] opacity-80" aria-label="Card Back Question Mark" />
              )}
            </button>
          );
        })}
      </div>

      {/* Rules Banner */}
      <div className="bg-amber-100 border-3 border-black p-3 rounded-xl max-w-md w-full text-center text-xs font-bold text-black shadow-[3px_3px_0px_#000]">
        💡 Flip 2 cards per turn. Match identical GitHub Octicons to claim pairs. Matching grants another turn!
      </div>
    </div>
  );
};
