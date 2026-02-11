<script setup>
import { ref, onMounted, watch } from 'vue'

const props = defineProps({
  text: String,
  sender: {
    type: String,
    validator: (v) => ['interviewer', 'candidate'].includes(v)
  },
  isTyping: Boolean
})

const displayedText = ref('')
const isFinished = ref(false)

const typeText = async () => {
  if (!props.text) return
  isFinished.value = false
  displayedText.value = ''
  
  const chars = props.text.split('')
  for (let i = 0; i < chars.length; i++) {
    displayedText.value += chars[i]
    await new Promise(resolve => setTimeout(resolve, 30)) // Typing speed
  }
  isFinished.value = true
}

onMounted(() => {
  if (!props.isTyping) {
    displayedText.value = props.text
    isFinished.value = true
  } else {
    typeText()
  }
})

watch(() => props.text, () => {
  if (props.isTyping) {
    typeText()
  } else {
    displayedText.value = props.text
    isFinished.value = true
  }
})
</script>

<template>
  <div class="mb-4 w-full flex" :class="sender === 'candidate' ? 'justify-end' : 'justify-start'">
    <div 
      class="max-w-[85%] p-4 relative text-sm md:text-base font-mono leading-relaxed"
      :class="[
        sender === 'interviewer' 
          ? 'bg-[#2a1a1a] text-gray-200 border-l-4 border-[#ff4444] rounded-r-lg' 
          : 'bg-[#1a2a3a] text-gray-200 border-r-4 border-[#4488ff] rounded-l-lg text-right'
      ]"
    >
      <!-- Typing Cursor -->
      <span v-html="displayedText"></span>
      <span v-if="!isFinished && isTyping" class="inline-block w-2 h-4 bg-white ml-1 animate-pulse"></span>
      
      <!-- Label -->
      <div 
        class="absolute -top-3 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border border-gray-700 bg-black"
        :class="sender === 'interviewer' ? 'left-0 text-[#ff4444]' : 'right-0 text-[#4488ff]'"
      >
        {{ sender === 'interviewer' ? 'DEFENSE' : 'ATTACK' }} SYSTEM
      </div>
    </div>
  </div>
</template>
