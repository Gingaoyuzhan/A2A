<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import NeoButton from '../components/NeoButton.vue'
import NeoCard from '../components/NeoCard.vue'
import { battleService } from '../services/BattleService'

const router = useRouter()

// 从 battleService 获取真实结果
const result = computed(() => battleService.getResult())

// 计算显示数据
const resultData = computed(() => {
  if (!result.value) {
    return {
      winRate: 0,
      grade: 'F',
      summary: '未获取到结果',
      feedback: []
    }
  }

  // 构建反馈列表
  const feedback = []
  if (result.value.strengths) {
    result.value.strengths.forEach(s => feedback.push(`✅ ${s}`))
  }
  if (result.value.weaknesses) {
    result.value.weaknesses.forEach(w => feedback.push(`⚠️ ${w}`))
  }

  return {
    winRate: result.value.winRate,
    grade: result.value.grade,
    summary: result.value.summary,
    feedback
  }
})

// 判断是否存活
const survived = computed(() => resultData.value.winRate >= 50)

const restart = () => {
  router.push('/')
}
</script>

<template>
  <div class="result-container min-h-screen p-8 flex flex-col items-center justify-center bg-[#1a1a1a] bg-opacity-95 bg-[url('/grid.svg')]">

    <div class="max-w-4xl w-full">
      <h1
        class="text-8xl font-black mb-12 text-center italic drop-shadow-[4px_4px_0_rgba(255,0,0,1)] uppercase"
        :class="survived ? 'text-yellow-400' : 'text-red-500'"
      >
        {{ survived ? 'YOU SURVIVED' : 'GAME OVER' }}
      </h1>

      <!-- Summary -->
      <div v-if="resultData.summary" class="text-center mb-8">
        <p class="text-xl text-gray-300">{{ resultData.summary }}</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <!-- Win Rate Card -->
        <NeoCard title="ODDS OF OFFER">
          <div class="flex items-center justify-center h-40">
            <span class="text-8xl font-black text-[#4488ff]">{{ resultData.winRate }}%</span>
          </div>
        </NeoCard>

        <!-- Grade Card -->
        <NeoCard title="PERFORMANCE GRADE">
          <div class="flex items-center justify-center h-40">
            <span class="text-8xl font-black text-[#ff4444]">{{ resultData.grade }}</span>
          </div>
        </NeoCard>
      </div>

      <!-- Feedback Section -->
      <NeoCard title="AI ANALYSIS">
        <ul class="space-y-4">
          <li v-for="(item, index) in resultData.feedback" :key="index" class="flex items-start bg-black/30 p-4 border-l-4 border-white">
            <span class="text-white font-mono text-lg">{{ item }}</span>
          </li>
        </ul>
      </NeoCard>

      <!-- Actions -->
      <div class="mt-12 flex justify-center gap-6">
        <NeoButton variant="primary" class="px-8 py-4 text-xl" @click="restart">PLAY AGAIN</NeoButton>
        <NeoButton variant="secondary" class="px-8 py-4 text-xl">SHARE REPORT</NeoButton>
      </div>
    </div>

  </div>
</template>
