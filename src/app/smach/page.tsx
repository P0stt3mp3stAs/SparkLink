"use client";
import { useState, useEffect } from 'react';

// Define types for our game
type Tile = {
  type: number;
  row: number;
  col: number;
};

type Position = {
  row: number;
  col: number;
  type?: number; // Add optional type property
};

type GameBoard = Tile[][];

type GameStatus = 'playing' | 'won' | 'lost';

const SmachGame = () => {
  const BOARD_SIZE = 8;
  const TILE_TYPES = 6;
  const TARGET_SCORE = 200;
  const GAME_DURATION = 3 * 60; // 3 minutes in seconds
  const COLORS = [
    'bg-red-500',     // Red
    'bg-blue-500',    // Blue
    'bg-green-500',   // Green
    'bg-yellow-500',  // Yellow
    'bg-purple-500',  // Purple
    'bg-pink-500',    // Pink
  ];

  const [board, setBoard] = useState<GameBoard>([]);
  const [score, setScore] = useState<number>(0);
  const [selectedTile, setSelectedTile] = useState<Position | null>(null);
  const [isSwapping, setIsSwapping] = useState<boolean>(false);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(GAME_DURATION);
  const [gameStatus, setGameStatus] = useState<GameStatus>('playing'); // 'playing', 'won', 'lost'

  // Initialize the game board
  useEffect(() => {
    initializeBoard();
  }, []);

  // Game timer
  useEffect(() => {
    if (gameStatus !== 'playing') return;

    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timer);
          setGameStatus('lost');
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStatus]);

  // Check win condition
  useEffect(() => {
    if (score >= TARGET_SCORE && gameStatus === 'playing') {
      setGameStatus('won');
    }
  }, [score, gameStatus]);

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Create a board without initial matches
  const initializeBoard = (): void => {
    let newBoard: GameBoard = [];
    let hasMatches = true;
    let attempts = 0;
    const maxAttempts = 100; // Prevent infinite loop
    
    // Keep generating boards until we get one without matches
    while (hasMatches && attempts < maxAttempts) {
      newBoard = [];
      for (let i = 0; i < BOARD_SIZE; i++) {
        const row: Tile[] = [];
        for (let j = 0; j < BOARD_SIZE; j++) {
          row.push({
            type: Math.floor(Math.random() * TILE_TYPES),
            row: i,
            col: j,
          });
        }
        newBoard.push(row);
      }
      
      hasMatches = checkForMatchesOnBoard(newBoard).hasMatches;
      attempts++;
    }
    
    setBoard(newBoard);
    setScore(0);
    setSelectedTile(null);
    setTimeLeft(GAME_DURATION);
    setGameStatus('playing');
  };

  // Check for matches on a given board (without state updates)
  const checkForMatchesOnBoard = (boardToCheck: GameBoard): { hasMatches: boolean; matches: Position[] } => {
    const newBoard = [...boardToCheck.map(row => [...row])];
    let hasMatches = false;
    const matches = new Set<string>();
    
    // Check for horizontal matches
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE - 2; col++) {
        if (
          newBoard[row][col].type === newBoard[row][col + 1].type &&
          newBoard[row][col].type === newBoard[row][col + 2].type
        ) {
          hasMatches = true;
          let matchLength = 3;
          while (col + matchLength < BOARD_SIZE && 
                 newBoard[row][col].type === newBoard[row][col + matchLength].type) {
            matchLength++;
          }
          
          for (let i = 0; i < matchLength; i++) {
            matches.add(`${row},${col + i}`);
          }
          
          // Skip the matched tiles
          col += matchLength - 1;
        }
      }
    }
    
    // Check for vertical matches
    for (let col = 0; col < BOARD_SIZE; col++) {
      for (let row = 0; row < BOARD_SIZE - 2; row++) {
        if (
          newBoard[row][col].type === newBoard[row + 1][col].type &&
          newBoard[row][col].type === newBoard[row + 2][col].type
        ) {
          hasMatches = true;
          let matchLength = 3;
          while (row + matchLength < BOARD_SIZE && 
                 newBoard[row][col].type === newBoard[row + matchLength][col].type) {
            matchLength++;
          }
          
          for (let i = 0; i < matchLength; i++) {
            matches.add(`${row + i},${col}`);
          }
          
          // Skip the matched tiles
          row += matchLength - 1;
        }
      }
    }
    
    return { 
      hasMatches, 
      matches: Array.from(matches).map(coord => {
        const [row, col] = coord.split(',').map(Number);
        return { row, col };
      }) 
    };
  };

  const handleTileClick = (row: number, col: number): void => {
    if (isSwapping || isAnimating || gameStatus !== 'playing') return;

    const clickedTile: Position = { row, col, type: board[row][col].type };

    if (!selectedTile) {
      // First tile selection
      setSelectedTile(clickedTile);
    } else {
      // Second tile selection - attempt swap
      if (
        (Math.abs(selectedTile.row - row) === 1 && selectedTile.col === col) ||
        (Math.abs(selectedTile.col - col) === 1 && selectedTile.row === row)
      ) {
        // Valid adjacent tile - attempt swap
        swapTiles(selectedTile, clickedTile);
      } else {
        // Not adjacent, just select the new tile
        setSelectedTile(clickedTile);
      }
    }
  };

  const swapTiles = async (tile1: Position, tile2: Position): Promise<void> => {
    setIsSwapping(true);
    
    // Create a copy of the board
    const newBoard: GameBoard = [...board.map(row => [...row])];
    
    // Swap the tiles
    const temp = newBoard[tile1.row][tile1.col];
    newBoard[tile1.row][tile1.col] = newBoard[tile2.row][tile2.col];
    newBoard[tile2.row][tile2.col] = temp;
    
    setBoard(newBoard);
    
    // Check for matches after swap
    const { hasMatches, matches } = checkForMatchesOnBoard(newBoard);
    
    if (hasMatches) {
      // If there are matches, proceed with the game logic
      await processMatches(matches);
    } else {
      // If no matches, swap back
      setTimeout(() => {
        const revertedBoard: GameBoard = [...newBoard.map(row => [...row])];
        revertedBoard[tile1.row][tile1.col] = newBoard[tile2.row][tile2.col];
        revertedBoard[tile2.row][tile2.col] = newBoard[tile1.row][tile1.col];
        setBoard(revertedBoard);
        setIsSwapping(false);
        setSelectedTile(null);
      }, 300);
    }
  };

  const processMatches = async (matches: Position[]): Promise<void> => {
    setIsAnimating(true);
    
    // Wait a bit for animation
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Create a copy of the board
    const newBoard: GameBoard = [...board.map(row => [...row])];
    
    // Process all matches
    const scoreToAdd = matches.length;
    
    // Mark matched tiles as empty (-1)
    matches.forEach(match => {
      newBoard[match.row][match.col] = { 
        ...newBoard[match.row][match.col], 
        type: -1 
      };
    });
    
    // Update score
    setScore(prev => prev + scoreToAdd);
    setBoard(newBoard);
    
    // Wait for animation
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Drop tiles to fill empty spaces
    dropTiles(newBoard);
  };

  const dropTiles = (currentBoard: GameBoard): void => {
    const newBoard: GameBoard = [...currentBoard.map(row => [...row])];
    
    // Drop tiles down
    for (let col = 0; col < BOARD_SIZE; col++) {
      // Count empty spaces and move tiles down
      let emptySpaces = 0;
      
      for (let row = BOARD_SIZE - 1; row >= 0; row--) {
        if (newBoard[row][col].type === -1) {
          emptySpaces++;
        } else if (emptySpaces > 0) {
          // Move tile down
          newBoard[row + emptySpaces][col] = newBoard[row][col];
          newBoard[row][col] = { ...newBoard[row][col], type: -1 };
        }
      }
      
      // Fill top with new tiles
      for (let row = 0; row < emptySpaces; row++) {
        newBoard[row][col] = {
          type: Math.floor(Math.random() * TILE_TYPES),
          row: row,
          col: col,
        };
      }
    }
    
    setBoard(newBoard);
    
    // Check for new matches after dropping
    setTimeout(() => {
      const { hasMatches, matches } = checkForMatchesOnBoard(newBoard);
      if (hasMatches) {
        processMatches(matches);
      } else {
        setIsAnimating(false);
        setIsSwapping(false);
        setSelectedTile(null);
      }
    }, 300);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_center,#1e3a8a,black)] text-white flex flex-col items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-md mb-4 sm:mb-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-center text-white drop-shadow-md mt-20">SMACH</h1>
      </div>

      <div className="flex flex-col items-center w-full">
        <div className="bg-gray-900/30 backdrop-blur-md border border-white/20 rounded-lg p-3 sm:p-4 shadow-lg mb-4 sm:mb-6 w-full max-w-md">
          <div className="flex justify-between items-center mb-3 sm:mb-4">
            <div className="text-xl sm:text-2xl font-bold">Score: <span className="text-yellow-300">{score}</span>/200</div>
            <div className="text-xl sm:text-2xl font-bold">Time: <span className={timeLeft <= 30 ? 'text-red-400' : 'text-yellow-300'}>{formatTime(timeLeft)}</span></div>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-1 sm:p-2 rounded-lg shadow-lg">
            <div className="grid grid-cols-8 gap-0.5 sm:gap-1">
              {board.map((row, rowIndex) =>
                row.map((tile, colIndex) => (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center cursor-pointer transition-transform ${
                      selectedTile && selectedTile.row === rowIndex && selectedTile.col === colIndex
                        ? 'ring-3 sm:ring-4 ring-white scale-105'
                        : 'ring-1 sm:ring-2 ring-indigo-900'
                    } ${
                      tile.type === -1 ? 'bg-indigo-900' : COLORS[tile.type]
                    } ${gameStatus !== 'playing' ? 'opacity-70' : ''}`}
                    onClick={() => handleTileClick(rowIndex, colIndex)}
                  >
                    {tile.type !== -1 && (
                      <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full bg-white/20"></div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex justify-between items-center mt-3 sm:mt-4">
            <button
              onClick={initializeBoard}
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-1.5 px-3 sm:py-2 sm:px-4 rounded-lg transition-colors text-sm sm:text-base"
            >
              New Game
            </button>
            
            {gameStatus !== 'playing' && (
              <div className={`text-lg sm:text-xl font-bold ${gameStatus === 'won' ? 'text-green-400' : 'text-red-400'}`}>
                {gameStatus === 'won' ? 'You Win! 🎉' : 'Time Up! 😢'}
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-800/30 backdrop-blur-md border border-white/20 rounded-lg p-3 sm:p-4 shadow-lg w-full max-w-md">
          <h2 className="text-lg sm:text-xl font-bold mb-2 text-center">How to Play</h2>
          <ol className="list-decimal list-inside space-y-1 text-xs sm:text-sm">
            <li>Click on a tile to select it</li>
            <li>Match 3 or more of the same color to score points</li>
            <li>Get 200 points before time runs out to win!</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default SmachGame;