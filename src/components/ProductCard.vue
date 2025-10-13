<template>
  <div class="product-card">
    <div v-if="product.badge" :class="['badge', product.badge.type]">
      {{ product.badge.text }}
    </div>
    <div class="product-image">{{ product.image }}</div>
    <div class="product-info">
      <h3 class="product-title">{{ product.title }}</h3>
      <p class="product-description">{{ product.description }}</p>
      <div class="product-price">
        <span v-if="product.originalPrice" class="original">¥{{ product.originalPrice }}</span>
        ¥{{ product.price }}
      </div>
      <button 
        :class="['btn', { added: isAdded }]"
        @click="addToCart"
        :disabled="isAdded"
      >
        {{ buttonText }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['add-to-cart'])

const isAdded = ref(false)
const buttonText = ref('立即购买')

const addToCart = () => {
  if (isAdded.value) return
  
  isAdded.value = true
  buttonText.value = '已加入购物车 ✓'
  
  emit('add-to-cart', props.product)
  
  // 2秒后恢复按钮状态
  setTimeout(() => {
    isAdded.value = false
    buttonText.value = '立即购买'
  }, 2000)
}
</script>
