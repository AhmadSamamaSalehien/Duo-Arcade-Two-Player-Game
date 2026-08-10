import { Difficulty, PlayerId } from '../types';

// ==========================================
// 1. TIC-TAC-TOE AI
// ==========================================
export function getTicTacToeMove(
  board: (PlayerId | null)[],
  difficulty: Difficulty,
  botPlayer: PlayerId
): number {
  const humanPlayer: PlayerId = botPlayer === 1 ? 2 : 1;
  const emptyIndices = board.map((val, idx) => (val === null ? idx : null)).filter((val): val is number => val !== null);

  if (emptyIndices.length === 0) return -1;

  if (difficulty === 'easy') {
    // 80% random, 20% check simple win
    if (Math.random() < 0.2) {
      const winMove = findWinningTicTacToeMove(board, botPlayer);
      if (winMove !== -1) return winMove;
    }
    return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
  }

  if (difficulty === 'medium') {
    // Check win, then check block, then center/corners, else random
    const winMove = findWinningTicTacToeMove(board, botPlayer);
    if (winMove !== -1) return winMove;

    const blockMove = findWinningTicTacToeMove(board, humanPlayer);
    if (blockMove !== -1) return blockMove;

    // Center
    if (board[4] === null) return 4;

    // Corners
    const corners = [0, 2, 6, 8].filter((i) => board[i] === null);
    if (corners.length > 0 && Math.random() < 0.7) {
      return corners[Math.floor(Math.random() * corners.length)];
    }

    return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
  }

  // HARD: Minimax
  let bestScore = -Infinity;
  let bestMove = emptyIndices[0];

  for (const index of emptyIndices) {
    board[index] = botPlayer;
    const score = minimaxTicTacToe(board, 0, false, botPlayer, humanPlayer);
    board[index] = null;

    if (score > bestScore) {
      bestScore = score;
      bestMove = index;
    }
  }

  return bestMove;
}

const WINNING_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
  [0, 4, 8], [2, 4, 6]            // Diagonals
];

function checkTicTacToeWinner(board: (PlayerId | null)[]): PlayerId | 'draw' | null {
  for (const line of WINNING_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  if (board.every((cell) => cell !== null)) return 'draw';
  return null;
}

function findWinningTicTacToeMove(board: (PlayerId | null)[], player: PlayerId): number {
  for (let i = 0; i < board.length; i++) {
    if (board[i] === null) {
      board[i] = player;
      const winner = checkTicTacToeWinner(board);
      board[i] = null;
      if (winner === player) return i;
    }
  }
  return -1;
}

function minimaxTicTacToe(
  board: (PlayerId | null)[],
  depth: number,
  isMaximizing: boolean,
  botPlayer: PlayerId,
  humanPlayer: PlayerId
): number {
  const winner = checkTicTacToeWinner(board);
  if (winner === botPlayer) return 10 - depth;
  if (winner === humanPlayer) return depth - 10;
  if (winner === 'draw') return 0;

  const emptyIndices = board.map((val, idx) => (val === null ? idx : null)).filter((val): val is number => val !== null);

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const index of emptyIndices) {
      board[index] = botPlayer;
      const evaluation = minimaxTicTacToe(board, depth + 1, false, botPlayer, humanPlayer);
      board[index] = null;
      maxEval = Math.max(maxEval, evaluation);
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const index of emptyIndices) {
      board[index] = humanPlayer;
      const evaluation = minimaxTicTacToe(board, depth + 1, true, botPlayer, humanPlayer);
      board[index] = null;
      minEval = Math.min(minEval, evaluation);
    }
    return minEval;
  }
}

// ==========================================
// 2. CONNECT FOUR AI
// ==========================================
const C4_ROWS = 6;
const C4_COLS = 7;

export function getConnectFourMove(
  grid: (PlayerId | null)[][],
  difficulty: Difficulty,
  botPlayer: PlayerId
): number {
  const validCols: number[] = [];
  for (let c = 0; c < C4_COLS; c++) {
    if (grid[0][c] === null) validCols.push(c);
  }

  if (validCols.length === 0) return 0;

  const humanPlayer: PlayerId = botPlayer === 1 ? 2 : 1;

  // Easy: Mostly random with 30% chance to block
  if (difficulty === 'easy') {
    if (Math.random() < 0.3) {
      const win = findC4InstantMove(grid, validCols, botPlayer);
      if (win !== null) return win;
      const block = findC4InstantMove(grid, validCols, humanPlayer);
      if (block !== null) return block;
    }
    return validCols[Math.floor(Math.random() * validCols.length)];
  }

  // Medium: Always take instant win & instant block, else prioritize middle
  if (difficulty === 'medium') {
    const win = findC4InstantMove(grid, validCols, botPlayer);
    if (win !== null) return win;
    const block = findC4InstantMove(grid, validCols, humanPlayer);
    if (block !== null) return block;

    // Prefer center column
    const centerCols = [3, 2, 4, 1, 5, 0, 6].filter((col) => validCols.includes(col));
    return centerCols[0];
  }

  // Hard: Score candidate drops
  let bestScore = -Infinity;
  let bestCol = validCols[0];

  for (const col of validCols) {
    const row = getC4NextRow(grid, col);
    if (row === -1) continue;

    grid[row][col] = botPlayer;
    let score = evaluateC4Board(grid, botPlayer);

    // Instant win bonus
    if (checkC4WinnerFrom(grid, row, col, botPlayer)) {
      score += 10000;
    }

    // Penalize giving human an instant win on next move
    const enemyRow = getC4NextRow(grid, col);
    if (enemyRow !== -1) {
      grid[enemyRow][col] = humanPlayer;
      if (checkC4WinnerFrom(grid, enemyRow, col, humanPlayer)) {
        score -= 8000;
      }
      grid[enemyRow][col] = null;
    }

    grid[row][col] = null;

    if (score > bestScore) {
      bestScore = score;
      bestCol = col;
    }
  }

  return bestCol;
}

function getC4NextRow(grid: (PlayerId | null)[][], col: number): number {
  for (let r = C4_ROWS - 1; r >= 0; r--) {
    if (grid[r][col] === null) return r;
  }
  return -1;
}

function findC4InstantMove(
  grid: (PlayerId | null)[][],
  validCols: number[],
  player: PlayerId
): number | null {
  for (const col of validCols) {
    const row = getC4NextRow(grid, col);
    if (row === -1) continue;
    grid[row][col] = player;
    const wins = checkC4WinnerFrom(grid, row, col, player);
    grid[row][col] = null;
    if (wins) return col;
  }
  return null;
}

function checkC4WinnerFrom(
  grid: (PlayerId | null)[][],
  r: number,
  c: number,
  p: PlayerId
): boolean {
  const directions = [
    [0, 1],  // horizontal
    [1, 0],  // vertical
    [1, 1],  // diagonal down-right
    [1, -1], // diagonal down-left
  ];

  for (const [dr, dc] of directions) {
    let count = 1;
    for (let step = 1; step <= 3; step++) {
      const nr = r + dr * step;
      const nc = c + dc * step;
      if (nr >= 0 && nr < C4_ROWS && nc >= 0 && nc < C4_COLS && grid[nr][nc] === p) count++;
      else break;
    }
    for (let step = 1; step <= 3; step++) {
      const nr = r - dr * step;
      const nc = c - dc * step;
      if (nr >= 0 && nr < C4_ROWS && nc >= 0 && nc < C4_COLS && grid[nr][nc] === p) count++;
      else break;
    }
    if (count >= 4) return true;
  }
  return false;
}

function evaluateC4Board(grid: (PlayerId | null)[][], botPlayer: PlayerId): number {
  let score = 0;
  // Center column preference
  for (let r = 0; r < C4_ROWS; r++) {
    if (grid[r][3] === botPlayer) score += 4;
  }
  return score;
}

// ==========================================
// 3. DOTS & BOXES AI
// ==========================================
export interface LineKey {
  type: 'h' | 'v';
  r: number;
  c: number;
}

export function getDotsAndBoxesMove(
  gridSize: number, // e.g. 4 (4x4 dots = 3x3 boxes)
  hLines: boolean[][],
  vLines: boolean[][],
  difficulty: Difficulty
): LineKey | null {
  const availableLines: LineKey[] = [];

  // Horizontal lines
  for (let r = 0; r <= gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (!hLines[r]?.[c]) availableLines.push({ type: 'h', r, c });
    }
  }

  // Vertical lines
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c <= gridSize; c++) {
      if (!vLines[r]?.[c]) availableLines.push({ type: 'v', r, c });
    }
  }

  if (availableLines.length === 0) return null;

  // 1. Look for a line that immediately completes a box
  const scoringMoves: LineKey[] = [];
  const safeMoves: LineKey[] = [];
  const dangerousMoves: LineKey[] = [];

  for (const line of availableLines) {
    const boxesCreated = countCompletedBoxes(gridSize, hLines, vLines, line);
    if (boxesCreated > 0) {
      scoringMoves.push(line);
    } else {
      // Check if placing this line creates a 3-sided box (which gives enemy a free box)
      const givesEnemyBox = creates3SidedBox(gridSize, hLines, vLines, line);
      if (givesEnemyBox) {
        dangerousMoves.push(line);
      } else {
        safeMoves.push(line);
      }
    }
  }

  // Always take scoring move if available!
  if (scoringMoves.length > 0) {
    return scoringMoves[Math.floor(Math.random() * scoringMoves.length)];
  }

  if (difficulty === 'easy') {
    // Easy: Pick random
    return availableLines[Math.floor(Math.random() * availableLines.length)];
  }

  if (difficulty === 'medium') {
    // Medium: Pick safe moves 70% of the time, else random
    if (safeMoves.length > 0 && Math.random() < 0.7) {
      return safeMoves[Math.floor(Math.random() * safeMoves.length)];
    }
    return availableLines[Math.floor(Math.random() * availableLines.length)];
  }

  // Hard: Strictly pick safe moves if available, else pick least bad line
  if (safeMoves.length > 0) {
    return safeMoves[Math.floor(Math.random() * safeMoves.length)];
  }

  return dangerousMoves[Math.floor(Math.random() * dangerousMoves.length)];
}

function countCompletedBoxes(
  gridSize: number,
  hLines: boolean[][],
  vLines: boolean[][],
  line: LineKey
): number {
  let count = 0;
  const { type, r, c } = line;

  // Temporarily set
  if (type === 'h') hLines[r][c] = true;
  else vLines[r][c] = true;

  // Check affected boxes
  if (type === 'h') {
    // Box above (r - 1)
    if (r > 0 && isBoxClosed(r - 1, c, hLines, vLines)) count++;
    // Box below (r)
    if (r < gridSize && isBoxClosed(r, c, hLines, vLines)) count++;
  } else {
    // Box left (c - 1)
    if (c > 0 && isBoxClosed(r, c - 1, hLines, vLines)) count++;
    // Box right (c)
    if (c < gridSize && isBoxClosed(r, c, hLines, vLines)) count++;
  }

  // Revert
  if (type === 'h') hLines[r][c] = false;
  else vLines[r][c] = false;

  return count;
}

function creates3SidedBox(
  gridSize: number,
  hLines: boolean[][],
  vLines: boolean[][],
  line: LineKey
): boolean {
  const { type, r, c } = line;

  if (type === 'h') hLines[r][c] = true;
  else vLines[r][c] = true;

  let creates3 = false;
  if (type === 'h') {
    if (r > 0 && countBoxSides(r - 1, c, hLines, vLines) === 3) creates3 = true;
    if (r < gridSize && countBoxSides(r, c, hLines, vLines) === 3) creates3 = true;
  } else {
    if (c > 0 && countBoxSides(r, c - 1, hLines, vLines) === 3) creates3 = true;
    if (c < gridSize && countBoxSides(r, c, hLines, vLines) === 3) creates3 = true;
  }

  if (type === 'h') hLines[r][c] = false;
  else vLines[r][c] = false;

  return creates3;
}

function countBoxSides(r: number, c: number, hLines: boolean[][], vLines: boolean[][]): number {
  let sides = 0;
  if (hLines[r]?.[c]) sides++;
  if (hLines[r + 1]?.[c]) sides++;
  if (vLines[r]?.[c]) sides++;
  if (vLines[r]?.[c + 1]) sides++;
  return sides;
}

function isBoxClosed(r: number, c: number, hLines: boolean[][], vLines: boolean[][]): boolean {
  return countBoxSides(r, c, hLines, vLines) === 4;
}

// ==========================================
// 4. MEMORY MATCH AI
// ==========================================
export function getMemoryBotFlip(
  unmatchedIndices: number[],
  memoryBank: Map<number, string>, // index -> iconName
  firstFlippedIndex: number | null,
  difficulty: Difficulty
): number {
  if (unmatchedIndices.length === 0) return 0;

  // Filter memory bank based on difficulty accuracy
  const knownIcons = new Map<number, string>();
  memoryBank.forEach((icon, idx) => {
    if (!unmatchedIndices.includes(idx)) return;
    const accuracy = difficulty === 'hard' ? 0.95 : difficulty === 'medium' ? 0.6 : 0.25;
    if (Math.random() < accuracy) {
      knownIcons.set(idx, icon);
    }
  });

  if (firstFlippedIndex !== null) {
    // Looking for match for first card
    const targetIcon = memoryBank.get(firstFlippedIndex);
    if (targetIcon) {
      for (const [idx, icon] of knownIcons.entries()) {
        if (idx !== firstFlippedIndex && icon === targetIcon) {
          return idx; // Found exact match!
        }
      }
    }
    // Random available card other than firstFlippedIndex
    const remaining = unmatchedIndices.filter((i) => i !== firstFlippedIndex);
    return remaining[Math.floor(Math.random() * remaining.length)];
  } else {
    // First flip: Check if we know any matching pair in memory!
    const iconToIndices = new Map<string, number[]>();
    knownIcons.forEach((icon, idx) => {
      const arr = iconToIndices.get(icon) || [];
      arr.push(idx);
      iconToIndices.set(icon, arr);
    });

    for (const [, indices] of iconToIndices.entries()) {
      if (indices.length >= 2) {
        return indices[0]; // Flip first card of known pair
      }
    }

    // Pick random unmatched index
    return unmatchedIndices[Math.floor(Math.random() * unmatchedIndices.length)];
  }
}
