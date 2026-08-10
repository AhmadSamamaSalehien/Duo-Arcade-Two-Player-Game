export type GameId = 
  | 'tictactoe' 
  | 'connectfour' 
  | 'dotsandboxes' 
  | 'pong' 
  | 'memory' 
  | 'reflex';

export type GameMode = 'friend' | 'bot';

export type Difficulty = 'easy' | 'medium' | 'hard';

export type PlayerId = 1 | 2; // Player 1 = RED, Player 2 = BLUE

export interface PlayerInfo {
  id: PlayerId;
  name: string;
  color: 'red' | 'blue';
  hex: string;
  avatarIcon: string;
  isBot: boolean;
  score: number;
}

export interface GameInfo {
  id: GameId;
  title: string;
  tagline: string;
  description: string;
  category: 'Strategy' | 'Arcade' | 'Memory' | 'Reflex' | 'Board';
  accentBg: string;
  accentText: string;
  iconName: string;
  bestFor: string;
}

export interface SessionStats {
  gamesPlayed: number;
  player1Wins: number; // Red
  player2Wins: number; // Blue
  draws: number;
  currentStreakPlayer: PlayerId | null;
  currentStreakCount: number;
  history: {
    gameId: GameId;
    gameTitle: string;
    winner: PlayerId | 'draw';
    mode: GameMode;
    difficulty?: Difficulty;
    timestamp: number;
  }[];
}

export interface GameSettings {
  mode: GameMode;
  difficulty: Difficulty;
  soundEnabled: boolean;
  startingPlayer: PlayerId;
  player1Name: string;
  player2Name: string;
}
