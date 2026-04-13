<template>
  <div class="game-zone">
    <NCard :title="isPlayer ? 'Vous' : 'Adversaire'" size="large">
      <div class="game-zone__score">KOs : {{ board?.koCount ?? 0 }} / 3</div>

      <div class="game-zone__active">
        <template v-if="board?.activeCard">
          <div class="active-card">
            <img
              :src="board.activeCard.imgUrl"
              :alt="board.activeCard.name"
              class="active-card__image"
            />
            <div class="active-card__info">
              <div class="active-card__name">{{ board.activeCard.name }}</div>
              <div class="active-card__hp">
                <div class="hp-bar">
                  <div class="hp-bar__track">
                    <div
                      class="hp-bar__fill"
                      :style="{
                        width: hpPercent + '%',
                        backgroundColor: hpColor(hpPercent),
                      }"
                    />
                  </div>
                  <span>
                    {{ board.activeCard.currentHp }} /
                    {{ board.activeCard.maxHp }} HP
                  </span>
                </div>
              </div>
            </div>
          </div>
        </template>
        <template v-else>
          <NEmpty description="Aucune carte active" />
        </template>
      </div>

      <div v-if="isPlayer" class="game-zone__hand">
        <slot name="hand" />
      </div>
    </NCard>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { useColors } from '../composables/useColors.js'
import type { PlayerBoard } from '../composables/useGameStore.js'

const props = defineProps<{
  board: PlayerBoard | null
  isPlayer: boolean
}>()

const { hpColor } = useColors()

const hpPercent = computed(() => {
  const active = props.board?.activeCard
  if (!active || active.maxHp <= 0) return 0
  return Math.max(0, Math.min(100, (active.currentHp / active.maxHp) * 100))
})
</script>

<style scoped>
.game-zone {
  width: 100%;
}

.game-zone__score {
  margin-bottom: 8px;
  font-weight: 600;
}

.game-zone__active {
  min-height: 140px;
}

.active-card {
  display: flex;
  gap: 12px;
  align-items: center;
}

.active-card__image {
  width: 96px;
  height: 96px;
  object-fit: cover;
  border-radius: 8px;
}

.active-card__name {
  font-weight: 600;
  margin-bottom: 8px;
}

.hp-bar {
  display: flex;
  align-items: center;
  gap: 8px;
}

.hp-bar__track {
  flex: 1;
  height: 8px;
  background-color: #eee;
  border-radius: 999px;
  overflow: hidden;
}

.hp-bar__fill {
  height: 100%;
}

.game-zone__hand {
  margin-top: 16px;
}
</style>
