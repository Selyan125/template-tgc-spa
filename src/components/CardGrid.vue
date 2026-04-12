<template>
  <div class="grid" :class="{ 'grid--selectable': selectable }">
    <PokemonCard
      v-for="card in cards"
      :key="card.id"
      :card="card"
      :size="size"
      :selectable="selectable"
      :selected="selectedIds.includes(card.id)"
      :disabled="isDisabled(card.id)"
      :current-hp="currentHpById?.[card.id]"
      @toggle="toggle"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import type { Card } from '../types/index.js'
import PokemonCard from './PokemonCard.vue'

const props = withDefaults(
  defineProps<{
    cards: Card[]
    modelValue?: number[]
    maxSelected?: number
    selectable?: boolean
    size?: 'sm' | 'md'
    currentHpById?: Record<number, number>
  }>(),
  {
    modelValue: () => [],
    maxSelected: 10,
    selectable: false,
    size: 'md',
    currentHpById: undefined,
  },
)

const emit = defineEmits<(e: 'update:modelValue', value: number[]) => void>()

const selectedIds = computed(() => props.modelValue)

const isDisabled = (cardId: number) => {
  if (!props.selectable) return false
  if (selectedIds.value.includes(cardId)) return false
  return selectedIds.value.length >= props.maxSelected
}

const toggle = (cardId: number) => {
  if (!props.selectable) return

  const isSelected = selectedIds.value.includes(cardId)
  if (isSelected) {
    emit(
      'update:modelValue',
      selectedIds.value.filter((id) => id !== cardId),
    )
    return
  }

  if (selectedIds.value.length >= props.maxSelected) return

  emit('update:modelValue', [...selectedIds.value, cardId])
}
</script>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
  gap: 12px;
}

.grid--selectable :deep(.card) {
  cursor: pointer;
}
</style>
