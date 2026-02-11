<script setup>
defineProps({
  modelValue: String,
  label: String,
  placeholder: String,
  type: {
    type: String,
    default: 'text'
  },
  isTextarea: {
    type: Boolean,
    default: false
  },
  rows: {
    type: Number,
    default: 4
  }
})

defineEmits(['update:modelValue'])
</script>

<template>
  <div class="mb-4">
    <label v-if="label" class="block text-white font-bold mb-2 uppercase tracking-wide text-sm">{{ label }}</label>
    
    <textarea 
      v-if="isTextarea"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      class="w-full bg-black text-white border-2 border-gray-600 p-3 focus:border-[#4488ff] focus:outline-none transition-colors font-mono resize-none"
      :rows="rows"
      :placeholder="placeholder"
    ></textarea>
    
    <input 
      v-else
      :type="type"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      class="w-full bg-black text-white border-2 border-gray-600 p-3 focus:border-[#4488ff] focus:outline-none transition-colors font-mono"
      :placeholder="placeholder"
    >
  </div>
</template>
