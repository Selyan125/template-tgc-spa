<template>
  <NModal :show="true" preset="card" :title="title">
    <div class="endgame-modal__content">
      <p>{{ message }}</p>
      <NButton type="primary" @click="$emit('back-to-lobby')">
        Retour au lobby
      </NButton>
    </div>
  </NModal>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  result: 'win' | 'lose' | 'draw' | null
}>()

const title = computed(() => {
  if (props.result === 'win') return 'Victoire !'
  if (props.result === 'lose') return 'Défaite'
  return 'Fin de partie'
})

const message = computed(() => {
  if (props.result === 'win') return 'Félicitations, vous avez gagné.'
  if (props.result === 'lose') return 'Vous avez perdu cette partie.'
  return 'La partie est terminée.'
})
</script>

<style scoped>
.endgame-modal__content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
