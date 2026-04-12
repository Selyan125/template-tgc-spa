<template>
  <div class="game-page">
    <GameZone :board="opponentBoard" :is-player="false" />

    <ActionBar
      :is-my-turn="gameStore.isMyTurn"
      :can-draw="canDraw"
      :can-attack="canAttack"
      :message="gameStore.lastMessage"
      @draw="handleDraw"
      @attack="handleAttack"
      @end-turn="handleEndTurn"
    />

    <GameZone :board="myBoard" :is-player="true">
      <template #hand>
        <PlayerHand
          v-if="myBoard"
          :hand="myBoard.hand"
          :deck-count="myBoard.deckCount"
          :is-my-turn="gameStore.isMyTurn"
          :has-active-card="!!myBoard.activeCard"
          @play-card="handlePlayCard"
        />
      </template>
    </GameZone>

    <EndGameModal
      v-if="gameStore.isGameOver"
      :result="gameStore.result"
      @back-to-lobby="handleBackToLobby"
    />
  </div>
</template>

<script setup lang="ts">
import { useMessage } from 'naive-ui'
import { computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'

import ActionBar from '../components/ActionBar.vue'
import EndGameModal from '../components/EndGameModal.vue'
import GameZone from '../components/GameZone.vue'
import PlayerHand from '../components/PlayerHand.vue'
import { useGameStore } from '../composables/useGameStore.js'

const gameStore = useGameStore()
const router = useRouter()
const message = useMessage()

onMounted(() => {
  if (!gameStore.socket) {
    gameStore.connect()
  }
})

const myBoard = computed(() => gameStore.myBoard)
const opponentBoard = computed(() => gameStore.opponentBoard)

const canDraw = computed(() => {
  const board = myBoard.value
  if (!board) return false

  return gameStore.isMyTurn && board.hand.length < 5 && board.deckCount > 0
})

const canAttack = computed(() => {
  const myB = myBoard.value
  const oppB = opponentBoard.value

  return gameStore.isMyTurn && !!myB?.activeCard && !!oppB?.activeCard
})

const handleDraw = () => {
  if (!canDraw.value) return
  gameStore.drawCards()
}

const handleAttack = () => {
  if (!canAttack.value) return
  gameStore.attack()
}

const handleEndTurn = () => {
  if (!gameStore.isMyTurn) return
  gameStore.endTurn()
}

const handlePlayCard = (cardId: number) => {
  if (!gameStore.isMyTurn) return
  gameStore.playCard(cardId)
}

const handleBackToLobby = () => {
  gameStore.resetGame()
  router.push('/')
}

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
.game-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px 0;
}
</style>
