<script setup>
defineProps({
  variant: {
    type: String,
    default: 'primary', // primary, secondary, danger
    validator: (value) => ['primary', 'secondary', 'danger'].includes(value)
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const variants = {
  primary: 'bg-[#4488ff] text-white hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[4px_4px_0_0_#ffffff]',
  secondary: 'bg-white text-black hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[4px_4px_0_0_#4488ff]',
  danger: 'bg-[#ff4444] text-white hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[4px_4px_0_0_#ffffff]'
}
</script>

<template>
  <button 
    class="font-bold py-3 px-6 border-2 border-black transition-all duration-200 active:translate-x-[0px] active:translate-y-[0px] active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
    :class="variants[variant]"
    :disabled="disabled"
  >
    <slot></slot>
  </button>
</template>
