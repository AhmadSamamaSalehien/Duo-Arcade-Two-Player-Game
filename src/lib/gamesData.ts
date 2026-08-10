import { GameInfo } from '../types';

export const GAMES_LIST: GameInfo[] = [
  {
    id: 'tictactoe',
    title: 'Tic-Tac-Toe Turbo',
    tagline: 'Classic 3x3 grid with tactical speed and power lines',
    description: 'Get 3 in a row horizontally, vertically, or diagonally. Fast-paced strategic classic.',
    category: 'Strategy',
    accentBg: 'bg-amber-300',
    accentText: 'text-amber-950',
    iconName: 'TableIcon',
    bestFor: 'Quick strategy warm-up'
  },
  {
    id: 'connectfour',
    title: 'Connect 4 Drop Battle',
    tagline: 'Gravity-powered token drop strategy duel',
    description: 'Drop colored tokens into the 7x6 vertical grid. Connect 4 tokens in any direction to win.',
    category: 'Board',
    accentBg: 'bg-emerald-300',
    accentText: 'text-emerald-950',
    iconName: 'IssueOpenedIcon',
    bestFor: 'Deep vertical strategy'
  },
  {
    id: 'dotsandboxes',
    title: 'Dots & Boxes',
    tagline: 'Claim territories by closing lines turn-by-turn',
    description: 'Connect adjacent dots to complete 1x1 boxes. Completing a box grants you +1 point & another turn!',
    category: 'Strategy',
    accentBg: 'bg-cyan-300',
    accentText: 'text-cyan-950',
    iconName: 'DotIcon',
    bestFor: 'Tactical spatial traps'
  },
  {
    id: 'pong',
    title: 'Pong Air Hockey',
    tagline: 'High-speed physics paddle showdown',
    description: 'Control your paddle on split controls or vs AI. Deflect the puck past your opponent’s goal line to score.',
    category: 'Arcade',
    accentBg: 'bg-rose-300',
    accentText: 'text-rose-950',
    iconName: 'FlameIcon',
    bestFor: 'Reflex & arcade thrill'
  },
  {
    id: 'memory',
    title: 'Memory Flip Duel',
    tagline: 'Flip cards to discover and match icon pairs',
    description: 'Turn 2 cards each turn. Match identical GitHub Octicons to claim points & earn an extra flip.',
    category: 'Memory',
    accentBg: 'bg-purple-300',
    accentText: 'text-purple-950',
    iconName: 'StackIcon',
    bestFor: 'Memory & concentration'
  },
  {
    id: 'reflex',
    title: 'Tap Reflex & Tug-of-War',
    tagline: 'Reaction speed & button mashing showdown',
    description: 'Test your lightning reaction time on green signals or pull the rope in a high-intensity mashing battle!',
    category: 'Reflex',
    accentBg: 'bg-orange-300',
    accentText: 'text-orange-950',
    iconName: 'ZapIcon',
    bestFor: 'High energy excitement'
  }
];
