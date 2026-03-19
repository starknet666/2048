export type Direction = "up" | "down" | "left" | "right";
export type GridSize = 3 | 4 | 5;

export interface TileData {
  id: number;
  value: number;
  row: number;
  col: number;
  isNew: boolean;
  isMerged: boolean;
}

export interface GameState {
  size: GridSize;
  board: number[][];
  score: number;
  tiles: TileData[];
  gameOver: boolean;
  won: boolean;
  moved: boolean;
  mergedMax: number;
}

const WIN_TARGET: Record<GridSize, number> = {
  3: 512,
  4: 2048,
  5: 4096,
};

let tileIdCounter = 0;

function nextTileId(): number {
  return ++tileIdCounter;
}

export function resetTileIds(): void {
  tileIdCounter = 0;
}

export function createEmptyBoard(size: GridSize): number[][] {
  return Array.from({ length: size }, () => Array(size).fill(0));
}

function getEmptyCells(board: number[][]): [number, number][] {
  const size = board.length;
  const cells: [number, number][] = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (board[r][c] === 0) cells.push([r, c]);
    }
  }
  return cells;
}

export function addRandomTile(board: number[][]): [number, number] | null {
  const empty = getEmptyCells(board);
  if (empty.length === 0) return null;
  const [r, c] = empty[Math.floor(Math.random() * empty.length)];
  board[r][c] = Math.random() < 0.9 ? 2 : 4;
  return [r, c];
}

export function initGame(size: GridSize): GameState {
  resetTileIds();
  const board = createEmptyBoard(size);
  addRandomTile(board);
  addRandomTile(board);
  return {
    size,
    board,
    score: 0,
    tiles: boardToTiles(board, size, true),
    gameOver: false,
    won: false,
    moved: false,
    mergedMax: 0,
  };
}

function boardToTiles(
  board: number[][],
  size: GridSize,
  allNew: boolean,
  newCell?: [number, number] | null,
  mergedCells?: Set<string>
): TileData[] {
  const tiles: TileData[] = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (board[r][c] !== 0) {
        const isNew = allNew || (newCell?.[0] === r && newCell?.[1] === c);
        const isMerged = mergedCells?.has(`${r},${c}`) ?? false;
        tiles.push({
          id: nextTileId(),
          value: board[r][c],
          row: r,
          col: c,
          isNew,
          isMerged,
        });
      }
    }
  }
  return tiles;
}

function rotateBoard(board: number[][]): number[][] {
  const n = board.length;
  const rotated = createEmptyBoard(n as GridSize);
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      rotated[c][n - 1 - r] = board[r][c];
    }
  }
  return rotated;
}

function slideRow(row: number[]): { newRow: number[]; score: number; merged: boolean[] } {
  const size = row.length;
  const filtered = row.filter((v) => v !== 0);
  const newRow: number[] = [];
  const merged: boolean[] = [];
  let score = 0;
  let i = 0;

  while (i < filtered.length) {
    if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
      const val = filtered[i] * 2;
      newRow.push(val);
      merged.push(true);
      score += val;
      i += 2;
    } else {
      newRow.push(filtered[i]);
      merged.push(false);
      i++;
    }
  }

  while (newRow.length < size) {
    newRow.push(0);
    merged.push(false);
  }

  return { newRow, score, merged };
}

function moveLeft(board: number[][]): { board: number[][]; score: number; moved: boolean; mergedCells: Set<string> } {
  const size = board.length;
  let score = 0;
  let moved = false;
  const newBoard = createEmptyBoard(size as GridSize);
  const mergedCells = new Set<string>();

  for (let r = 0; r < size; r++) {
    const { newRow, score: rowScore, merged } = slideRow(board[r]);
    newBoard[r] = newRow;
    score += rowScore;

    for (let c = 0; c < size; c++) {
      if (newRow[c] !== board[r][c]) moved = true;
      if (merged[c]) mergedCells.add(`${r},${c}`);
    }
  }

  return { board: newBoard, score, moved, mergedCells };
}

function transformMergedCells(mergedCells: Set<string>, rotations: number, size: number): Set<string> {
  const transformed = new Set<string>();
  for (const key of mergedCells) {
    const [r, c] = key.split(",").map(Number);
    let nr = r, nc = c;
    for (let i = 0; i < rotations; i++) {
      const tmp = nr;
      nr = nc;
      nc = size - 1 - tmp;
    }
    transformed.add(`${nr},${nc}`);
  }
  return transformed;
}

export function move(state: GameState, direction: Direction): GameState {
  if (state.gameOver) return state;

  const size = state.size;
  let board = state.board.map((row) => [...row]);
  let rotations = 0;

  switch (direction) {
    case "left":
      rotations = 0;
      break;
    case "down":
      rotations = 1;
      break;
    case "right":
      rotations = 2;
      break;
    case "up":
      rotations = 3;
      break;
  }

  for (let i = 0; i < rotations; i++) {
    board = rotateBoard(board);
  }

  const result = moveLeft(board);

  if (!result.moved) {
    return { ...state, moved: false, mergedMax: 0 };
  }

  let finalBoard = result.board;
  const inverseRotations = (4 - rotations) % 4;
  for (let i = 0; i < inverseRotations; i++) {
    finalBoard = rotateBoard(finalBoard);
  }

  const mergedCells = transformMergedCells(result.mergedCells, inverseRotations, size);
  const newCell = addRandomTile(finalBoard);
  const newScore = state.score + result.score;
  const target = WIN_TARGET[size];
  const won = !state.won && finalBoard.some((row) => row.some((v) => v >= target));
  const gameOver = !canMove(finalBoard);

  let mergedMax = 0;
  for (const key of mergedCells) {
    const [r, c] = key.split(",").map(Number);
    if (finalBoard[r][c] > mergedMax) mergedMax = finalBoard[r][c];
  }

  return {
    size,
    board: finalBoard,
    score: newScore,
    tiles: boardToTiles(finalBoard, size, false, newCell, mergedCells),
    gameOver,
    won: state.won || won,
    moved: true,
    mergedMax,
  };
}

function canMove(board: number[][]): boolean {
  const size = board.length;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (board[r][c] === 0) return true;
      if (c < size - 1 && board[r][c] === board[r][c + 1]) return true;
      if (r < size - 1 && board[r][c] === board[r + 1][c]) return true;
    }
  }
  return false;
}

export function getBestScore(size: GridSize): number {
  if (typeof window === "undefined") return 0;
  return parseInt(localStorage.getItem(`2048-best-${size}`) || "0", 10);
}

export function saveBestScore(score: number, size: GridSize): void {
  if (typeof window === "undefined") return;
  const best = getBestScore(size);
  if (score > best) {
    localStorage.setItem(`2048-best-${size}`, score.toString());
  }
}
