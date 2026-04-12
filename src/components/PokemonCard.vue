<template>
  <div
    class="card"
    :class="[
      `card--${size}`,
      { 'card--selected': selected, 'card--disabled': disabled },
    ]"
    :data-testid="`pokemon-card-${card.id}`"
    @click="handleClick"
  >
    <div class="card__header">
      <div class="card__name">
        <span class="card__pokedex"
          >#{{ String(card.pokedexNumber).padStart(3, '0') }}</span
        >
        <span class="card__title">{{ card.name }}</span>
      </div>
      <span class="card__type" :style="{ backgroundColor: typeColor }">
        {{ card.type }}
      </span>
    </div>

    <div class="card__body">
      <img
        class="card__img"
        :src="card.imgUrl"
        :alt="card.name"
        loading="lazy"
      />

      <div class="card__stats">
        <div class="card__stat">
          <span class="card__statLabel">HP</span>
          <span class="card__statValue">{{ card.hp }}</span>
        </div>
        <div class="card__stat">
          <span class="card__statLabel">ATK</span>
          <span class="card__statValue">{{ card.attack }}</span>
        </div>
      </div>
    </div>

    <div v-if="currentHp !== undefined" class="card__hp">
      <div class="card__hpTop">
        <span class="card__hpLabel">HP courants</span>
        <span class="card__hpValue">{{ currentHp }} / {{ card.hp }}</span>
      </div>
      <div class="hpbar" aria-hidden="true">
        <div
          class="hpbar__fill"
          :style="{ width: `${hpPercent}%`, backgroundColor: hpBarColor }"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { useColors } from '../composables/useColors.js'
import type { Card } from '../types/index.js'

const props = withDefaults(
  defineProps<{
    card: Card
    size?: 'sm' | 'md'
    selected?: boolean
    disabled?: boolean
    selectable?: boolean
    currentHp?: number
  }>(),
  {
    size: 'md',
    selected: false,
    disabled: false,
    selectable: false,
    currentHp: undefined,
  },
)

const emit = defineEmits<(e: 'toggle', cardId: number) => void>()

const { getTypeColor, hpColor } = useColors()

const typeColor = computed(() => getTypeColor(props.card.type))

const hpPercent = computed(() => {
  if (props.currentHp === undefined) return 0
  const percent = (props.currentHp / props.card.hp) * 100
  return Math.max(0, Math.min(100, Math.round(percent)))
})

const hpBarColor = computed(() => hpColor(hpPercent.value))

const handleClick = () => {
  if (!props.selectable) return
  if (props.disabled) return
  emit('toggle', props.card.id)
}
</script>

<style scoped>
.card {
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 12px;
  padding: 12px;
  background: white;
  transition:
    transform 120ms ease,
    box-shadow 120ms ease,
    opacity 120ms ease;
  user-select: none;
}

.card--md {
  width: 220px;
}

.card--sm {
  width: 170px;
  padding: 10px;
}

.card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
}

.card__name {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.card__pokedex {
  font-size: 12px;
  opacity: 0.65;
}

.card__title {
  font-weight: 700;
  line-height: 1.1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card__type {
  color: white;
  font-size: 12px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 999px;
  flex: 0 0 auto;
}

.card__body {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}

.card__img {
  width: 100%;
  height: 120px;
  object-fit: contain;
}

.card--sm .card__img {
  height: 92px;
}

.card__stats {
  display: flex;
  justify-content: space-between;
}

.card__stat {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.card__statLabel {
  font-size: 12px;
  opacity: 0.65;
}

.card__statValue {
  font-weight: 700;
}

.card--selected {
  box-shadow: 0 0 0 2px rgba(24, 160, 88, 0.55);
}

.card--disabled {
  opacity: 0.45;
  filter: grayscale(0.4);
  pointer-events: none;
}

.card__hp {
  margin-top: 10px;
}

.card__hpTop {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  opacity: 0.75;
  margin-bottom: 6px;
}

.hpbar {
  height: 8px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.hpbar__fill {
  height: 100%;
  border-radius: 999px;
}
</style>
