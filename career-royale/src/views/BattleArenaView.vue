<script setup>
import { ref, onMounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { battleService } from '../services/BattleService'
import ChatBubble from '../components/ChatBubble.vue'
import NeoButton from '../components/NeoButton.vue'

const router = useRouter()
const chatContainerLeft = ref(null)
const chatContainerRight = ref(null)

const scrollToBottom = async () => {
  await nextTick()
  if (chatContainerLeft.value) chatContainerLeft.value.scrollTop = chatContainerLeft.value.scrollHeight
  if (chatContainerRight.value) chatContainerRight.value.scrollTop = chatContainerRight.value.scrollHeight
}

watch(() => battleService.state.messages.length, () => {
  scrollToBottom()
})

const skipAnimation = () => {
  battleService.state.turboMode = !battleService.state.turboMode
}

const forfeit = () => {
  battleService.stopBattle()
  router.push('/')
}

onMounted(async () => {
  if (!battleService.state.isBattleActive) {
    // Redirect if direct access without init
    router.push('/')
    return
  }

  try {
    const result = await battleService.startBattle()
    if (result) {
      setTimeout(() => {
          router.push('/result')
      }, 2000)
    }
  } catch (error) {
    console.error('[Battle] Error:', error)
    // 可以显示错误提示
  }
})
</script>

<template>
  <div class="h-screen w-full bg-black overflow-hidden flex flex-col relative font-mono">
    
    <!-- Top HUD -->
    <div class="absolute top-0 w-full z-20 flex justify-between px-4 py-2 bg-black/50 backdrop-blur-sm border-b border-[#333]">
      <div class="text-[#ff4444] font-bold flex items-center gap-2">
        <div class="w-3 h-3 bg-[#ff4444] rounded-full animate-pulse"></div>
        INTERVIEWER
      </div>
      <div class="text-white font-black text-xl italic">ROUND {{ battleService.state.round }}</div>
      <div class="text-[#4488ff] font-bold flex items-center gap-2">
        CANDIDATE
        <div class="w-3 h-3 bg-[#4488ff] rounded-full animate-pulse"></div>
      </div>
    </div>

    <!-- Main Battle Area -->
    <div class="flex-1 flex flex-col md:flex-row relative mt-12 mb-20">
      
      <!-- Left: Interviewer View -->
      <div 
        class="flex-1 border-r border-[#333] relative bg-[#110505] flex flex-col transition-all"
        :class="{ 'shake-effect': battleService.state.damageEvent === 'interviewer', 'border-red-500': battleService.state.damageEvent === 'interviewer' }"
      >
        <!-- Flash Overlay -->
        <div v-if="battleService.state.damageEvent === 'interviewer'" class="damage-overlay"></div>
        <!-- HP Bar -->
        <div class="w-full h-1 bg-gray-800">
          <div class="h-full bg-[#ff4444] transition-all duration-500" :style="{ width: battleService.state.interviewerHP + '%' }"></div>
        </div>
        
        <!-- Avatar/Status Stub -->
        <div class="absolute top-4 left-4 opacity-20 pointer-events-none">
          <h1 class="text-6xl font-black text-[#ff4444]">HR</h1>
        </div>

        <div ref="chatContainerLeft" class="flex-1 overflow-y-auto p-4 scrollbar-hide">
             <template v-for="msg in battleService.state.messages" :key="msg.id">
                <ChatBubble v-if="msg.sender === 'interviewer'" :text="msg.text" :sender="msg.sender" :isTyping="msg.isTyping" />
             </template>
        </div>
      </div>

      <!-- VS Badge (Center Overlay) -->
      <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none">
        <div class="relative">
          <div class="absolute inset-0 bg-yellow-400 blur-lg opacity-50 animate-pulse"></div>
          <div class="bg-black border-4 border-white text-yellow-400 font-black text-5xl italic w-24 h-24 flex items-center justify-center rounded-full shadow-[0_0_30px_rgba(255,255,0,0.3)] transform rotate-[-5deg]">
            VS
          </div>
        </div>
      </div>

      <!-- Right: Candidate View -->
      <div 
        class="flex-1 relative bg-[#050b11] flex flex-col transition-all"
        :class="{ 'shake-effect': battleService.state.damageEvent === 'candidate', 'border-red-500': battleService.state.damageEvent === 'candidate' }"
      >
        <!-- Flash Overlay -->
        <div v-if="battleService.state.damageEvent === 'candidate'" class="damage-overlay"></div>
         <!-- HP Bar -->
         <div class="w-full h-1 bg-gray-800">
           <div class="h-full bg-[#4488ff] transition-all duration-500 ml-auto" :style="{ width: battleService.state.candidateHP + '%' }"></div>
         </div>

         <!-- Avatar/Status Stub -->
         <div class="absolute top-4 right-4 opacity-20 pointer-events-none text-right">
          <h1 class="text-6xl font-black text-[#4488ff]">YOU</h1>
        </div>

        <div ref="chatContainerRight" class="flex-1 overflow-y-auto p-4 scrollbar-hide">
            <template v-for="msg in battleService.state.messages" :key="msg.id">
                <ChatBubble v-if="msg.sender === 'candidate'" :text="msg.text" :sender="msg.sender" :isTyping="msg.isTyping" />
             </template>
        </div>
      </div>

    </div>

    <!-- Bottom Controls (Debug / Status) -->
    <div class="absolute bottom-0 w-full h-16 bg-[#1a1a1a] border-t border-[#333] flex items-center justify-between px-6 z-20">
      <div class="text-xs text-gray-500 font-mono">
        SYSTEM: CONNECTED<br>
        LATENCY: 24ms
      </div>
      
      <div class="flex gap-2">
        <NeoButton variant="secondary" class="text-xs py-2 px-4" @click="skipAnimation">
          {{ battleService.state.turboMode ? 'NORMAL SPEED' : 'TURBO MODE' }}
        </NeoButton>
        <NeoButton variant="danger" class="text-xs py-2 px-4" @click="forfeit">FORFEIT</NeoButton>
      </div>
    </div>

  </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
    display: none;
}
.scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
</style>
