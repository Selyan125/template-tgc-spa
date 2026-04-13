<template>
  <div class="player-hand">
    <div class="player-hand__header">
      <span>Main ({{ hand.length }}/5)</span>
      <span>Deck : {{ deckCount }}</span>
    </div>

    <div class="player-hand__cards">
      <NCard
        v-for="card in hand"
        :key="card.id"
        size="small"
        class="player-hand__card"
        :hoverable="canPlay"
        :class="{ 'player-hand__card--disabled': !canPlay }"
        @click="onPlay(card.id)"
      >
        <div class="player-hand__card-content">
          <img :src="card.imgUrl" :alt="card.name" class="player-hand__image" />
          <div class="player-hand__info">
            <div class="player-hand__name">{{ card.name }}</div>
            <div class="player-hand__stats">
              HP {{ card.currentHp }} • ATK {{ card.attack }}
            </div>
          </div>
        </div>
      </NCard>

      <NEmpty v-if="hand.length === 0" description="Aucune carte en main" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import type { InGameCard } from '../composables/useGameStore.js'

const props = defineProps<{
  hand: InGameCard[]
  deckCount: number
  isMyTurn: boolean
  hasActiveCard: boolean
}>()

const emit = defineEmits<{
  'play-card': [cardId: number]
}>()

const canPlay = computed(() => props.isMyTurn && !props.hasActiveCard)

const onPlay = (cardId: number) => {
  if (!canPlay.value) return
  emit('play-card', cardId)
}
</script>

<style scoped>
.player-hand__header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
}

.player-hand__cards {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.player-hand__card {
  width: 150px;
  cursor: pointer;
}

.player-hand__card--disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.player-hand__card-content {
  display: flex;
  gap: 8px;
}

.player-hand__image {
  width: 48px;
  height: 48px;
  object-fit: cover;
  border-radius: 4px;
}

.player-hand__name {
  font-weight: 600;
  margin-bottom: 4px;
}

.player-hand__stats {
  font-size: 12px;
  opacity: 0.8;
}
</style>
