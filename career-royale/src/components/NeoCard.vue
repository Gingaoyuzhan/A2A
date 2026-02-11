<script setup>
defineProps({
  title: String
})
</script>

<template>
  <div class="bg-[#242424] border-2 border-white p-6 relative shadow-[8px_8px_0_0_#000000]">
    <div v-if="title" class="absolute -top-4 left-4 bg-yellow-400 text-black font-black px-2 py-1 border-2 border-black transform -rotate-2">
      {{ title }}
    </div>
    <slot></slot>
  </div>
</template>
