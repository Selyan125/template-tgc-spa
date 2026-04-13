<template>
  <div class="action-bar">
    <NCard>
      <div class="action-bar__content">
        <div class="action-bar__status">
          <NTag :type="isMyTurn ? 'success' : 'warning'">
            {{ isMyTurn ? "C'est votre tour" : "Tour de l'adversaire" }}
          </NTag>
        </div>

        <div class="action-bar__buttons">
          <NButton
            type="primary"
            :disabled="!isMyTurn || !canDraw"
            @click="$emit('draw')"
          >
            Piocher
          </NButton>
          <NButton
            type="error"
            :disabled="!isMyTurn || !canAttack"
            @click="$emit('attack')"
          >
            Attaquer
          </NButton>
          <NButton :disabled="!isMyTurn" @click="$emit('end-turn')">
            Fin de tour
          </NButton>
        </div>

        <div v-if="message" class="action-bar__message">
          <NText depth="3">{{ message }}</NText>
        </div>
      </div>
    </NCard>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  isMyTurn: boolean
  canDraw: boolean
  canAttack: boolean
  message: string | null
}>()
</script>

<style scoped>
.action-bar {
  width: 100%;
}

.action-bar__content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.action-bar__buttons {
  display: flex;
  gap: 8px;
}

.action-bar__message {
  font-size: 13px;
}
</style>
