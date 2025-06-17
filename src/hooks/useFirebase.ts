import { useEffect, useState } from 'react';
import { ref, push, set, get, onValue, off, remove, update } from 'firebase/database';
import { database } from '../firebase/config';
import { Room, Player } from '../types/game';

export const useFirebase = () => {
  const [loading, setLoading] = useState(false);

  const generateRoomId = (): string => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const generatePlayerId = (): string => {
    return Math.random().toString(36).substring(2, 15);
  };

  const createRoom = async (hostName: string, maxPlayers: number): Promise<string> => {
    setLoading(true);
    try {
      const roomId = generateRoomId();
      const playerId = generatePlayerId();
      
      const newRoom: Room = {
        id: roomId,
        hostId: playerId,
        maxPlayers,
        players: {},
        currentTurn: playerId,
        gameStarted: false,
        gameEnded: false,
        winner: null,
        selectedNumbers: [],
        createdAt: Date.now()
      };

      const hostPlayer: Player = {
        id: playerId,
        name: hostName,
        board: generateBingoBoard(),
        selectedNumbers: [],
        bingoLetters: [],
        isReady: false,
        isWinner: false
      };

      newRoom.players[playerId] = hostPlayer;

      await set(ref(database, `rooms/${roomId}`), newRoom);
      localStorage.setItem('playerId', playerId);
      localStorage.setItem('playerName', hostName);
      
      return roomId;
    } catch (error) {
      console.error('Error creating room:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const joinRoom = async (roomId: string, playerName: string): Promise<boolean> => {
    setLoading(true);
    try {
      const roomRef = ref(database, `rooms/${roomId}`);
      const snapshot = await get(roomRef);
      
      if (!snapshot.exists()) {
        throw new Error('Room not found');
      }

      const room: Room = snapshot.val();
      const playerCount = Object.keys(room.players).length;

      if (playerCount >= room.maxPlayers) {
        throw new Error('Room is full');
      }

      if (room.gameStarted) {
        throw new Error('Game already started');
      }

      const playerId = generatePlayerId();
      const newPlayer: Player = {
        id: playerId,
        name: playerName,
        board: generateBingoBoard(),
        selectedNumbers: [],
        bingoLetters: [],
        isReady: false,
        isWinner: false
      };

      await update(ref(database, `rooms/${roomId}/players/${playerId}`), newPlayer);
      localStorage.setItem('playerId', playerId);
      localStorage.setItem('playerName', playerName);

      return true;
    } catch (error) {
      console.error('Error joining room:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const findQuickPlayRoom = async (playerName: string): Promise<string | null> => {
    setLoading(true);
    try {
      const roomsRef = ref(database, 'rooms');
      const snapshot = await get(roomsRef);
      
      if (!snapshot.exists()) {
        return null;
      }

      const rooms: { [key: string]: Room } = snapshot.val();
      
      // Find available room with space
      for (const [roomId, room] of Object.entries(rooms)) {
        const playerCount = Object.keys(room.players).length;
        if (!room.gameStarted && playerCount < room.maxPlayers && playerCount > 0) {
          await joinRoom(roomId, playerName);
          return roomId;
        }
      }

      return null;
    } catch (error) {
      console.error('Error finding quick play room:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const generateBingoBoard = (): number[][] => {
    const board: number[][] = [];
    const usedNumbers = new Set<number>();
    
    for (let i = 0; i < 5; i++) {
      const row: number[] = [];
      for (let j = 0; j < 5; j++) {
        let num: number;
        do {
          num = Math.floor(Math.random() * 25) + 1;
        } while (usedNumbers.has(num));
        
        usedNumbers.add(num);
        row.push(num);
      }
      board.push(row);
    }
    
    return board;
  };

  const updatePlayerReady = async (roomId: string, playerId: string, isReady: boolean) => {
    await update(ref(database, `rooms/${roomId}/players/${playerId}`), { isReady });
  };

  const startGame = async (roomId: string) => {
    await update(ref(database, `rooms/${roomId}`), { gameStarted: true });
  };

  const selectNumber = async (roomId: string, playerId: string, number: number) => {
    const roomRef = ref(database, `rooms/${roomId}`);
    const snapshot = await get(roomRef);
    const room: Room = snapshot.val();
    
    if (room.currentTurn !== playerId) return;

    const updatedSelectedNumbers = [...room.selectedNumbers, number];
    const playerIds = Object.keys(room.players);
    const currentIndex = playerIds.indexOf(playerId);
    const nextTurn = playerIds[(currentIndex + 1) % playerIds.length];

    await update(roomRef, {
      selectedNumbers: updatedSelectedNumbers,
      currentTurn: nextTurn
    });

    // Check for bingo
    await checkBingo(roomId, playerId, updatedSelectedNumbers);
  };

  const checkBingo = async (roomId: string, playerId: string, selectedNumbers: number[]) => {
    const roomRef = ref(database, `rooms/${roomId}`);
    const snapshot = await get(roomRef);
    const room: Room = snapshot.val();
    const player = room.players[playerId];
    
    const bingoTypes = ['row', 'column', 'diagonal'];
    const newBingoLetters = [...player.bingoLetters];
    
    // Check rows
    for (let i = 0; i < 5; i++) {
      if (player.board[i].every(num => selectedNumbers.includes(num))) {
        if (!newBingoLetters.includes('B') && newBingoLetters.length === 0) newBingoLetters.push('B');
        else if (!newBingoLetters.includes('I') && newBingoLetters.length === 1) newBingoLetters.push('I');
        else if (!newBingoLetters.includes('N') && newBingoLetters.length === 2) newBingoLetters.push('N');
        else if (!newBingoLetters.includes('G') && newBingoLetters.length === 3) newBingoLetters.push('G');
        else if (!newBingoLetters.includes('O') && newBingoLetters.length === 4) newBingoLetters.push('O');
      }
    }
    
    // Check columns
    for (let j = 0; j < 5; j++) {
      const column = [];
      for (let i = 0; i < 5; i++) {
        column.push(player.board[i][j]);
      }
      if (column.every(num => selectedNumbers.includes(num))) {
        if (!newBingoLetters.includes('B') && newBingoLetters.length === 0) newBingoLetters.push('B');
        else if (!newBingoLetters.includes('I') && newBingoLetters.length === 1) newBingoLetters.push('I');
        else if (!newBingoLetters.includes('N') && newBingoLetters.length === 2) newBingoLetters.push('N');
        else if (!newBingoLetters.includes('G') && newBingoLetters.length === 3) newBingoLetters.push('G');
        else if (!newBingoLetters.includes('O') && newBingoLetters.length === 4) newBingoLetters.push('O');
      }
    }
    
    // Check diagonals
    const diagonal1 = [0, 1, 2, 3, 4].map(i => player.board[i][i]);
    const diagonal2 = [0, 1, 2, 3, 4].map(i => player.board[i][4 - i]);
    
    if (diagonal1.every(num => selectedNumbers.includes(num)) || diagonal2.every(num => selectedNumbers.includes(num))) {
      if (!newBingoLetters.includes('B') && newBingoLetters.length === 0) newBingoLetters.push('B');
      else if (!newBingoLetters.includes('I') && newBingoLetters.length === 1) newBingoLetters.push('I');
      else if (!newBingoLetters.includes('N') && newBingoLetters.length === 2) newBingoLetters.push('N');
      else if (!newBingoLetters.includes('G') && newBingoLetters.length === 3) newBingoLetters.push('G');
      else if (!newBingoLetters.includes('O') && newBingoLetters.length === 4) newBingoLetters.push('O');
    }

    await update(ref(database, `rooms/${roomId}/players/${playerId}`), {
      bingoLetters: newBingoLetters
    });

    // Check for winner
    if (newBingoLetters.length === 5) {
      await update(ref(database, `rooms/${roomId}`), {
        gameEnded: true,
        winner: playerId
      });
      
      await update(ref(database, `rooms/${roomId}/players/${playerId}`), {
        isWinner: true
      });
    }
  };

  const deleteRoom = async (roomId: string) => {
    await remove(ref(database, `rooms/${roomId}`));
  };

  const subscribeToRoom = (roomId: string, callback: (room: Room | null) => void) => {
    const roomRef = ref(database, `rooms/${roomId}`);
    onValue(roomRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.val());
      } else {
        callback(null);
      }
    });
    
    return () => off(roomRef);
  };

  return {
    loading,
    createRoom,
    joinRoom,
    findQuickPlayRoom,
    updatePlayerReady,
    startGame,
    selectNumber,
    deleteRoom,
    subscribeToRoom,
    generatePlayerId
  };
};