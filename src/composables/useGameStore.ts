import { defineStore } from 'pinia'
import { io } from 'socket.io-client'

import router from '../router.js'
import type { Card } from '../types/index.js'
import { useStorage } from './useStorage.js'

export type PlayerRole = 'host' | 'guest'

export interface InGameCard extends Card {
  currentHp: number
  maxHp: number
}

export interface PlayerBoard {
  koCount: number
  activeCard: InGameCard | null
  hand: InGameCard[]
  deckCount: number
}

export interface GameState {
  roomId: string
  host: PlayerBoard
  guest: PlayerBoard
  currentTurn: PlayerRole
  winner?: PlayerRole | null
}

export interface Room {
  id: string
  name?: string
  players?: number
  status?: 'waiting' | 'running'
}

interface GameStoreState {
  socket: unknown
  isConnected: boolean
  rooms: Room[]
  currentRoomId: string | null
  role: PlayerRole | null
  isMyTurn: boolean
  gameState: GameState | null
  result: 'win' | 'lose' | 'draw' | null
  lastError: string | null
  lastMessage: string | null
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string
const SOCKET_URL = API_BASE_URL.replace('/api', '')
const storage = useStorage()

export const useGameStore = defineStore('game', {
  state: (): GameStoreState => ({
    socket: null,
    isConnected: false,
    rooms: [],
    currentRoomId: null,
    role: null,
    isMyTurn: false,
    gameState: null,
    result: null,
    lastError: null,
    lastMessage: null,
  }),

  getters: {
    myBoard(state): PlayerBoard | null {
      if (!state.gameState || !state.role) return null
      return state.role === 'host'
        ? state.gameState.host
        : state.gameState.guest
    },

    opponentBoard(state): PlayerBoard | null {
      if (!state.gameState || !state.role) return null
      return state.role === 'host'
        ? state.gameState.guest
        : state.gameState.host
    },

    isGameOver(state): boolean {
      return !!state.result || !!state.gameState?.winner
    },
  },

  actions: {
    connect() {
      const token = storage.get<string>('token')
      if (!token) {
        this.lastError = 'Utilisateur non authentifié'
        return
      }

      if (this.socket) {
        return
      }

      this.socket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket'],
      })

      this.socket.on('connect', () => {
        this.isConnected = true
        this.loadRooms()
      })

      this.socket.on('disconnect', () => {
        this.isConnected = false
      })

      this.socket.on('roomsList', (rooms: Room[]) => {
        this.rooms = rooms
      })

      this.socket.on('roomsListUpdated', () => {
        this.loadRooms()
      })

      this.socket.on('roomCreated', (roomId: string) => {
        this.currentRoomId = roomId
      })

      this.socket.on(
        'gameStarted',
        (payload: { roomId: string; role: PlayerRole; state?: GameState }) => {
          this.currentRoomId = payload.roomId
          this.role = payload.role
          if (payload.state) {
            this.updateGameState(payload.state)
          }
          router.push('/game')
        },
      )

      this.socket.on('error', (err: { message?: string } | string) => {
        this.lastError =
          typeof err === 'string' ? err : err.message || 'Erreur inconnue'
      })

      this.socket.on('gameStateUpdated', (state: GameState) => {
        this.updateGameState(state)
      })

      this.socket.on(
        'gameEnded',
        (state: GameState & { winner: PlayerRole }) => {
          this.updateGameState(state)
          if (!this.role) return
          this.result = state.winner === this.role ? 'win' : 'lose'
        },
      )

      this.socket.on('opponentDisconnected', () => {
        this.lastMessage = "Votre adversaire s'est déconnecté."
      })
    },

    loadRooms() {
      if (!this.socket) return
      this.socket.emit('getRooms')
    },

    createRoom(deckId: number) {
      if (!this.socket) return
      this.socket.emit('createRoom', { deckId })
    },

    joinRoom(roomId: string, deckId: number) {
      if (!this.socket) return
      this.currentRoomId = roomId
      this.socket.emit('joinRoom', { roomId, deckId })
    },

    // Game actions
    drawCards() {
      this.socket?.emit('drawCards')
    },

    playCard(cardId: number) {
      this.socket?.emit('playCard', { cardId })
    },

    attack() {
      this.socket?.emit('attack')
    },

    endTurn() {
      this.socket?.emit('endTurn')
    },

    updateGameState(state: GameState) {
      this.gameState = state
      if (this.role) {
        this.isMyTurn = state.currentTurn === this.role
      } else {
        this.isMyTurn = false
      }
    },

    resetGame() {
      this.gameState = null
      this.currentRoomId = null
      this.role = null
      this.isMyTurn = false
      this.result = null
      this.lastError = null
      this.lastMessage = null
    },
  },
})
