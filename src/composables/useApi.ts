import type {
  AuthResponse,
  Card,
  Deck,
  DeckPayload,
  SignInPayload,
  SignUpPayload,
} from '../types/index.js'
import { useStorage } from './useStorage.js'

const BASE_URL = import.meta.env.VITE_API_BASE_URL
const NORMALIZED_BASE_URL = BASE_URL?.replace(/\/$/, '')
const storage = useStorage()

const request = async <T>(path: string, options: RequestInit = {}) => {
  const token = storage.get<string>('token')

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  if (!NORMALIZED_BASE_URL) {
    throw new Error(
      "VITE_API_BASE_URL n'est pas configuré. Crée un fichier .env (cf .env.example) avec VITE_API_BASE_URL=http://localhost:3001/api",
    )
  }

  // Timeout pour éviter un loading infini si l'API est injoignable
  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), 15000)

  let res: Response
  try {
    res = await fetch(`${NORMALIZED_BASE_URL}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
    })
  } catch (e) {
    if ((e as { name?: string })?.name === 'AbortError') {
      throw new Error(
        "Timeout: l'API ne répond pas (15s). Vérifie que le backend tourne et que VITE_API_BASE_URL est correcte.",
      )
    }
    throw new Error(
      "Impossible de contacter l'API (Failed to fetch). Vérifie que le backend tourne et que VITE_API_BASE_URL est correcte.",
    )
  } finally {
    window.clearTimeout(timeoutId)
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(
      (data as { message?: string }).message || `Erreur ${res.status}`,
    )
  }

  return res.json() as Promise<T>
}

/**
 * Composable exposant toutes les méthodes HTTP de l'API.
 *
 * - Le token JWT est injecté automatiquement dans chaque requête.
 * - En cas d'erreur (4xx, 5xx), une exception est levée avec le message renvoyé par l'API.
 *
 * @example
 * const api = useApi()
 * const cards = await api.getCards()
 */
export function useApi() {
  /** Connecte un utilisateur existant. Retourne le token JWT et les infos utilisateur. */
  const signIn = ({ email, password }: SignInPayload) =>
    request<AuthResponse>('/auth/sign-in', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })

  /** Crée un nouveau compte. Retourne le token JWT et les infos utilisateur. */
  const signUp = ({ email, password, username }: SignUpPayload) =>
    request<AuthResponse>('/auth/sign-up', {
      method: 'POST',
      body: JSON.stringify({ email, password, username }),
    })

  /** Retourne toutes les cartes Pokémon disponibles. */
  const getCards = () => request<Card[]>('/cards')

  /** Retourne les decks de l'utilisateur connecté. */
  const getMyDecks = () => request<Deck[]>('/decks/mine')

  /** Retourne un deck par son id (avec ses cartes). */
  const getDeck = (id: string | number) => request<Deck>(`/decks/${id}`)

  /** Crée un nouveau deck. `cards` est un tableau de 10 `cardId`. */
  const createDeck = ({ name, cards }: DeckPayload) =>
    request<Deck>('/decks', {
      method: 'POST',
      body: JSON.stringify({ name, cards }),
    })

  /** Met à jour le nom et/ou les cartes d'un deck existant. */
  const updateDeck = (id: string | number, { name, cards }: DeckPayload) =>
    request<Deck>(`/decks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ name, cards }),
    })

  /** Supprime un deck par son id. */
  const deleteDeck = (id: string | number) =>
    request<unknown>(`/decks/${id}`, { method: 'DELETE' })

  return {
    signIn,
    signUp,
    getCards,
    getMyDecks,
    getDeck,
    createDeck,
    updateDeck,
    deleteDeck,
  }
}
