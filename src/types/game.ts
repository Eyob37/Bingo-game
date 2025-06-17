export interface Player {
  id: string;
  name: string;
  board: number[][];
  selectedNumbers: number[];
  bingoLetters: string[];
  isReady: boolean;
  isWinner: boolean;
}

export interface Room {
  id: string;
  hostId: string;
  maxPlayers: number;
  players: { [playerId: string]: Player };
  currentTurn: string;
  gameStarted: boolean;
  gameEnded: boolean;
  winner: string | null;
  selectedNumbers: number[];
  createdAt: number;
}

export interface GameState {
  currentPlayer: Player | null;
  currentRoom: Room | null;
  isHost: boolean;
}