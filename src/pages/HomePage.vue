<template>
  <div class="home">
    <div class="home__hero">
      <div class="home__hero-text">
        <h1>Lobby</h1>
        <p>
          Choisissez un deck, créez ou rejoignez une room et lancez une partie.
        </p>
      </div>
      <img src="/gameplay.avif" alt="Gameplay" class="home__hero-image" />
    </div>

    <div class="home__content">
      <NCard title="Deck & actions" class="home__panel">
        <NSpace vertical :size="16">
          <NSelect
            v-model:value="selectedDeckId"
            :options="deckOptions"
            placeholder="Choisissez un deck"
            :loading="loadingDecks"
          />

          <NSpace>
            <NButton
              type="primary"
              :disabled="!selectedDeckId || !isConnected"
              @click="handleCreateRoom"
            >
              Créer une room
            </NButton>
            <NButton
              :disabled="!selectedDeckId || !selectedRoomId || !isConnected"
              @click="handleJoinRoom"
            >
              Rejoindre la room
            </NButton>
          </NSpace>
        </NSpace>
      </NCard>

      <NCard title="Rooms disponibles" class="home__panel">
        <NList v-if="rooms.length">
          <NListItem
            v-for="room in rooms"
            :key="room.id"
            :class="{
              'home__room--selected': room.id === selectedRoomId,
            }"
            @click="selectedRoomId = room.id"
          >
            <div class="home__room">
              <div>
                <strong>Room {{ room.id }}</strong>
                <div class="home__room-meta">
                  {{ room.players ?? 0 }} joueur(s)
                  <span v-if="room.status">• {{ room.status }}</span>
                </div>
              </div>
            </div>
          </NListItem>
        </NList>
        <NEmpty v-else description="Aucune room disponible pour le moment" />
      </NCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMessage } from 'naive-ui'
import { computed, onMounted, ref, watch } from 'vue'

import { useApi } from '../composables/useApi.js'
import { useGameStore } from '../composables/useGameStore.js'
import type { Deck } from '../types/index.js'

const api = useApi()
const gameStore = useGameStore()
const message = useMessage()

const decks = ref<Deck[]>([])
const loadingDecks = ref(false)
const selectedDeckId = ref<number | null>(null)
const selectedRoomId = ref<string | null>(null)

const rooms = computed(() => gameStore.rooms)
const isConnected = computed(() => gameStore.isConnected)

const deckOptions = computed(() =>
  decks.value.map((deck) => ({ label: deck.name, value: deck.id })),
)

const handleCreateRoom = () => {
  if (!selectedDeckId.value) return
  gameStore.createRoom(selectedDeckId.value)
}

const handleJoinRoom = () => {
  if (!selectedDeckId.value || !selectedRoomId.value) return
  gameStore.joinRoom(selectedRoomId.value, selectedDeckId.value)
}

onMounted(async () => {
  gameStore.connect()

  loadingDecks.value = true
  try {
    decks.value = await api.getMyDecks()
  } catch (err) {
    const e = err as Error
    message.error(e.message || 'Erreur lors du chargement des decks')
  } finally {
    loadingDecks.value = false
  }
})

watch(
  () => gameStore.lastError,
  (err) => {
    if (err) message.error(err)
  },
)

watch(
  () => gameStore.lastMessage,
  (msg) => {
    if (msg) message.info(msg)
  },
)
</script>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.home__hero {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
}

.home__hero-text h1 {
  margin: 0 0 8px;
}

.home__hero-image {
  max-width: 420px;
  border-radius: 16px;
}

.home__content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 16px;
}

.home__panel {
  height: 100%;
}

.home__room {
  display: flex;
  justify-content: space-between;
}

.home__room-meta {
  font-size: 12px;
  opacity: 0.8;
}

.home__room--selected {
  background-color: rgba(24, 160, 88, 0.08);
  cursor: pointer;
}
</style>
