<template>
  <div 
    class="carousel"
    ref="containerEl"
    @mouseenter="pause"
    @mouseleave="resume"
    @touchstart.passive="onTouchStart"
    @touchmove.prevent="onTouchMove"
    @touchend.passive="onTouchEnd"
    @mousedown.prevent="onMouseDown"
    @mousemove.prevent="onMouseMove"
    @mouseup.prevent="onMouseUp"
    @mouseleave.capture="onMouseLeave"
  >
    <div class="track" :style="trackStyle">
      <div v-for="(src, idx) in images" :key="idx" class="slide">
        <img :src="src" alt="slide" />
      </div>
    </div>
    <button class="nav left" @click="prev" aria-label="上一张">‹</button>
    <button class="nav right" @click="next" aria-label="下一张">›</button>
    <div class="dots">
      <button 
        v-for="(src, idx) in images" :key="'dot-'+idx"
        :class="['dot', { active: idx === currentIndex }]"
        @click="go(idx)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  images: { type: Array, default: () => [] },
  autoplay: { type: Boolean, default: true },
  interval: { type: Number, default: 3000 },
  loop: { type: Boolean, default: true },
})

const currentIndex = ref(0)
const isPaused = ref(false)
const isDragging = ref(false)
const startX = ref(0)
const deltaX = ref(0)
let timer = null

const count = computed(() => props.images.length)

const trackStyle = computed(() => {
  const baseTranslate = -currentIndex.value * 100
  const dragPercent = isDragging.value && count.value > 0
    ? (deltaX.value / containerWidth.value) * 100
    : 0
  return {
    transform: `translateX(${baseTranslate + dragPercent}%)`,
    transition: isDragging.value ? 'none' : 'transform .35s ease',
  }
})

const containerWidth = ref(1)
const containerEl = ref(null)

const next = () => {
  if (count.value === 0) return
  if (currentIndex.value < count.value - 1) {
    currentIndex.value += 1
  } else if (props.loop) {
    currentIndex.value = 0
  }
}

const prev = () => {
  if (count.value === 0) return
  if (currentIndex.value > 0) {
    currentIndex.value -= 1
  } else if (props.loop) {
    currentIndex.value = count.value - 1
  }
}

const go = (idx) => {
  if (idx < 0 || idx >= count.value) return
  currentIndex.value = idx
}

const startAutoplay = () => {
  stopAutoplay()
  if (!props.autoplay || count.value <= 1) return
  timer = setInterval(() => {
    if (!isPaused.value) next()
  }, Math.max(1200, props.interval))
}

const stopAutoplay = () => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

const pause = () => { isPaused.value = true }
const resume = () => { isPaused.value = false }

const onTouchStart = (e) => {
  if (!count.value) return
  isDragging.value = true
  startX.value = e.touches[0].clientX
  deltaX.value = 0
  isPaused.value = true
}

const onTouchMove = (e) => {
  if (!isDragging.value) return
  deltaX.value = e.touches[0].clientX - startX.value
}

const onTouchEnd = () => {
  endDrag()
}

const mouseActive = ref(false)
const onMouseDown = (e) => {
  mouseActive.value = true
  isDragging.value = true
  startX.value = e.clientX
  deltaX.value = 0
  isPaused.value = true
}
const onMouseMove = (e) => {
  if (!mouseActive.value || !isDragging.value) return
  deltaX.value = e.clientX - startX.value
}
const onMouseUp = () => { endDrag() }
const onMouseLeave = () => { if (mouseActive.value) endDrag(true) }

const endDrag = (cancel = false) => {
  mouseActive.value = false
  if (!isDragging.value) return
  isDragging.value = false
  const threshold = containerWidth.value * 0.2
  if (!cancel) {
    if (deltaX.value > threshold) {
      prev()
    } else if (deltaX.value < -threshold) {
      next()
    }
  }
  deltaX.value = 0
  isPaused.value = false
}

const onVisibility = () => {
  if (document.hidden) {
    stopAutoplay()
  } else {
    startAutoplay()
  }
}

onMounted(() => {
  containerWidth.value = containerEl.value?.clientWidth || 1
  window.addEventListener('resize', () => {
    containerWidth.value = containerEl.value?.clientWidth || 1
  })
  document.addEventListener('visibilitychange', onVisibility)
  startAutoplay()
})

onBeforeUnmount(() => {
  stopAutoplay()
  document.removeEventListener('visibilitychange', onVisibility)
})
</script>

<style scoped>
.carousel { position: relative; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 20px rgba(0,0,0,.1); }
.track { display: flex; width: 100%; }
.slide { min-width: 100%; user-select: none; }
.slide img { width: 100%; aspect-ratio: 1/1; object-fit: cover; display: block; }
.nav { position: absolute; top: 50%; transform: translateY(-50%); z-index: 2; width: 32px; height: 32px; border-radius: 50%; border: none; background: rgba(255,255,255,.85); color: #5a4a15; display: none; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 4px 10px rgba(0,0,0,.15); }
.nav.left { left: 8px; }
.nav.right { right: 8px; }
.carousel:hover .nav { display: flex; }
.nav:active { transform: translateY(-50%) scale(.96); }
.dots { position: absolute; left: 0; right: 0; bottom: 8px; display: flex; justify-content: center; gap: 6px; }
.dot { width: 10px; height: 10px; border-radius: 50%; border: none; background: rgba(255,255,255,.6); cursor: pointer; }
.dot.active { background: #C89B3C; }
/* 保持各端 1:1 比例，与详情页布局一致 */
/* 触屏设备隐藏箭头，避免占位与 UI 干扰 */
@media (hover: none), (pointer: coarse){
  .nav { display: none !important; }
}
</style>

