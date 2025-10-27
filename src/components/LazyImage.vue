<template>
  <div class="lazy-image-container" ref="containerRef">
    <img 
      v-if="isLoaded" 
      :src="src" 
      :alt="alt"
      class="lazy-image"
      @load="onImageLoad"
      @error="onImageError"
    />
    <div 
      v-else 
      class="lazy-placeholder"
      :style="{ aspectRatio: aspectRatio }"
    >
      <div class="loading-spinner"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'

const props = defineProps({
  src: { type: String, required: true },
  alt: { type: String, default: '' },
  aspectRatio: { type: String, default: '1/1' },
  rootMargin: { type: String, default: '50px' },
  threshold: { type: Number, default: 0.1 }
})

const emit = defineEmits(['load', 'error'])

const containerRef = ref(null)
const isLoaded = ref(false)
const isIntersecting = ref(false)
let observer = null

const onImageLoad = () => {
  emit('load')
}

const onImageError = () => {
  emit('error')
}

const handleIntersection = (entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      isIntersecting.value = true
      isLoaded.value = true
      // 一旦开始加载就停止观察
      if (observer) {
        observer.unobserve(entry.target)
      }
    }
  })
}

onMounted(async () => {
  await nextTick()
  
  // 检查是否支持 IntersectionObserver
  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver(handleIntersection, {
      rootMargin: props.rootMargin,
      threshold: props.threshold
    })
    
    if (containerRef.value) {
      observer.observe(containerRef.value)
    }
  } else {
    // 不支持 IntersectionObserver 的浏览器直接加载
    isLoaded.value = true
  }
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
  }
})
</script>

<style scoped>
.lazy-image-container {
  position: relative;
  width: 100%;
  overflow: hidden;
}

.lazy-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: opacity 0.3s ease;
}

.lazy-placeholder {
  width: 100%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #e0e0e0;
  border-top: 2px solid #C89B3C;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 手机端优化 */
@media (max-width: 768px) {
  .lazy-placeholder {
    background: #f5f5f5;
  }
  
  .loading-spinner {
    width: 16px;
    height: 16px;
    border-width: 1.5px;
  }
}
</style>
