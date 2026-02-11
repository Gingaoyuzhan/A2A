<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import NeoButton from '../components/NeoButton.vue'
import NeoCard from '../components/NeoCard.vue'
import NeoInput from '../components/NeoInput.vue'
import { battleService } from '../services/BattleService'

const router = useRouter()

const resumeText = ref('')
const jdText = ref('')
const selectedMode = ref('hard') // 'easy' | 'hard'

const jdPresets = [
  { label: 'ByteDance Backend', value: 'Senior Backend Engineer at ByteDance. Requirements: 5+ years Go/Python, High Concurrency, Microservices.' },
  { label: 'Tencent Product Manager', value: 'Senior PM at Tencent. Requirements: User Insight, Data Analysis, 3+ years in Social Networking.' },
  { label: 'Global Bank Deviant', value: 'Cobol Maintainer. Requirements: 20 years experience, soul sold to finance.' }
]

const startBattle = () => {
  if (!resumeText.value || !jdText.value) return
  
  battleService.init(resumeText.value, jdText.value, selectedMode.value)
  router.push('/battle')
}

const applyPreset = (text) => {
  jdText.value = text
}
</script>

<template>
  <div class="landing-container min-h-screen p-8 flex flex-col items-center justify-center bg-[#1a1a1a] bg-opacity-90 bg-[url('/grid.svg')]">
    <!-- Hero Section -->
    <div class="text-center mb-12">
      <h1 class="text-7xl font-black mb-2 glitch-layers relative inline-block text-white" data-text="CAREER ROYALE">
        CAREER ROYALE
      </h1>
      <p class="text-xl text-[#4488ff] font-bold tracking-widest uppercase mt-4">
        Agent 嘴替 · 职场大逃杀
      </p>
      <p class="text-gray-400 mt-2 max-w-lg mx-auto">
        "社恐福音：由 AI 替身代你直面 800 个心眼子的面试官，躺着拿 Offer 胜率预测。"
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">
      
      <!-- Player Setup -->
      <NeoCard title="STEP 1: UPLOAD SOUL">
        <NeoInput 
          v-model="resumeText"
          label="Paste Resume / CV" 
          placeholder="Paste your resume text here..." 
          :isTextarea="true" 
          :rows="8"
        />
        <div class="text-xs text-gray-500 mt-[-10px] mb-4">* PDF Upload Mocked for Demo</div>
      </NeoCard>

      <!-- Enemy Setup -->
      <NeoCard title="STEP 2: CHOOSE ENEMY">
        <div class="mb-4">
          <label class="block text-white font-bold mb-2 uppercase text-sm">Quick Presets</label>
          <div class="flex flex-wrap gap-2">
            <button 
              v-for="preset in jdPresets" 
              :key="preset.label"
              @click="applyPreset(preset.value)"
              class="text-xs border border-gray-600 px-2 py-1 hover:bg-[#4488ff] hover:text-white transition-colors text-gray-300"
            >
              {{ preset.label }}
            </button>
          </div>
        </div>

        <NeoInput 
          v-model="jdText"
          label="Job Description" 
          placeholder="Paste Job Description here..." 
          :isTextarea="true" 
          :rows="5"
        />
      </NeoCard>
    </div>

    <!-- Mode Selection -->
    <div class="mt-8 w-full max-w-5xl">
      <NeoCard title="STEP 3: DIFFICULTY">
        <div class="flex gap-4">
          <div 
            @click="selectedMode = 'easy'"
            class="flex-1 border-2 p-4 cursor-pointer transition-all hover:bg-[#2a2a2a]"
            :class="selectedMode === 'easy' ? 'border-[#4488ff] bg-[#1a2a3a]' : 'border-gray-700'"
          >
            <h3 class="font-bold text-[#4488ff] mb-1">EASY MODE</h3>
            <p class="text-sm text-gray-400">Gen-Z HR Sister. Friendly questions. High acceptance rate.</p>
          </div>
          
          <div 
            @click="selectedMode = 'hard'"
            class="flex-1 border-2 p-4 cursor-pointer transition-all hover:bg-[#2a1a1a]"
            :class="selectedMode === 'hard' ? 'border-[#ff4444] bg-[#2a1a1a]' : 'border-gray-700'"
          >
            <h3 class="font-bold text-[#ff4444] mb-1">HELL MODE</h3>
            <p class="text-sm text-gray-400">Ali P8 Architect. Deep Dive. Stress Test. Mental breakdown imminent.</p>
          </div>
        </div>
      </NeoCard>
    </div>

    <!-- Actions -->
    <div class="mt-12">
      <NeoButton 
        variant="danger" 
        class="text-2xl px-12 py-4"
        :disabled="!resumeText || !jdText"
        @click="startBattle"
      >
        START BATTLE
      </NeoButton>
    </div>
  </div>
</template>

<style scoped>
/* Simple Glitch Effect */
.glitch-layers {
  position: relative;
  animation: glitch-skew 1s infinite linear alternate-reverse;
}
.glitch-layers::before,
.glitch-layers::after {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
.glitch-layers::before {
  left: 2px;
  text-shadow: -1px 0 #ff00c1;
  clip: rect(44px, 450px, 56px, 0);
  animation: glitch-anim 5s infinite linear alternate-reverse;
}
.glitch-layers::after {
  left: -2px;
  text-shadow: -1px 0 #00fff9;
  clip: rect(44px, 450px, 56px, 0);
  animation: glitch-anim2 5s infinite linear alternate-reverse;
}

@keyframes glitch-anim {
  0% { clip: rect(31px, 9999px, 94px, 0); }
  20% { clip: rect(6px, 9999px, 8px, 0); }
  40% { clip: rect(56px, 9999px, 2px, 0); }
  60% { clip: rect(2px, 9999px, 93px, 0); }
  80% { clip: rect(44px, 9999px, 40px, 0); }
  100% { clip: rect(69px, 9999px, 89px, 0); }
}
@keyframes glitch-anim2 {
  0% { clip: rect(65px, 9999px, 10px, 0); }
  20% { clip: rect(33px, 9999px, 34px, 0); }
  40% { clip: rect(10px, 9999px, 3px, 0); }
  60% { clip: rect(26px, 9999px, 64px, 0); }
  80% { clip: rect(4px, 9999px, 13px, 0); }
  100% { clip: rect(98px, 9999px, 20px, 0); }
}
</style>
