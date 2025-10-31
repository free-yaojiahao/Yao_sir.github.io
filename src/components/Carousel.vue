<template>
  <div 
    class="carousel"
    ref="containerEl"
    @touchstart.passive="onTouchStart"
    @touchmove="onTouchMove"
    @touchend.passive="onTouchEnd"
    @mousedown.prevent="onMouseDown"
    @mousemove.prevent="onMouseMove"
    @mouseup.prevent="onMouseUp"
    @mouseleave.capture="onMouseLeave"
  >
    <div class="track" :style="trackStyle">
      <div v-for="(src, idx) in images" :key="idx" class="slide">
        <img v-if="isImage(src)" :src="src" alt="slide" @click="openPreview(idx)" style="cursor: zoom-in" />
        <video 
          v-else 
          :src="src" 
          controls 
          :poster="videoPoster(src)"
          class="carousel-video"
          playsinline
          webkit-playsinline
          muted
          @click="toFullscreen($event, src)"
        />
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
    <vue-easy-lightbox
      :visible="previewVisible"
      :imgs="images.filter(isImage)"
      :index="imgPreviewIndex"
      @hide="previewVisible = false"
    />
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted, onBeforeUnmount } from 'vue'
import VueEasyLightbox from 'vue-easy-lightbox'

const props = defineProps({
  images: { type: Array, default: () => [] },
  autoplay: { type: Boolean, default: true },
  interval: { type: Number, default: 3000 },
  loop: { type: Boolean, default: true },
})

const isImage = (src) => /\.(jpe?g|png|gif|webp|svg)$/i.test(src)
const isVideo = (src) => /\.(mp4|mov|webm)$/i.test(src)

const previewVisible = ref(false)
const previewIndex = ref(0)
// 只计算所有图片在原数组中的下标对应，图片预览才不会错位
const imgIndexes = computed(() => props.images.map((v,i) => isImage(v)?i:null).filter(v=>v!==null))
const imgPreviewIndex = computed({
  get() {
    const idx = imgIndexes.value.indexOf(previewIndex.value)
    return idx === -1 ? 0 : idx
  },
  set(v) {
    previewIndex.value = imgIndexes.value[v] ?? 0
  }
})
const openPreview = (idx) => {
  // 只允许图片进预览
  if (isImage(props.images[idx])) {
    previewIndex.value = idx
    previewVisible.value = true
  }
}
const videoPoster = (src) => '' // 可根据需求补充视频封面
const toFullscreen = (e, src) => {
  // 仅video生效，点击全屏
  const v = e.target;
  if (v.requestFullscreen) v.requestFullscreen()
  else if (v.webkitRequestFullScreen) v.webkitRequestFullScreen()
  else if (v.msRequestFullscreen) v.msRequestFullscreen()
}

const currentIndex = ref(0)
const isPaused = ref(false)
const isDragging = ref(false)
const startX = ref(0)
const deltaX = ref(0)
let timer = null
let videoEl = null

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
  stopCurrentVideo()
  if (currentIndex.value < count.value - 1) {
    currentIndex.value += 1
  } else if (props.loop) {
    currentIndex.value = 0
  }
  handleSlideEnter()
}

const prev = () => {
  if (count.value === 0) return
  stopCurrentVideo()
  if (currentIndex.value > 0) {
    currentIndex.value -= 1
  } else if (props.loop) {
    currentIndex.value = count.value - 1
  }
  handleSlideEnter()
}

const go = (idx) => {
  if (idx < 0 || idx >= count.value) return
  if (idx === currentIndex.value) return
  stopCurrentVideo()
  currentIndex.value = idx
  handleSlideEnter()
}

const startAutoplay = () => {
  stopAutoplay()
  if (!props.autoplay || count.value <= 1) return
  timer = setInterval(() => {
    if (!isPaused.value) next()
  }, props.interval)
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

function getCurrentVideo() {
  const slides = containerEl.value?.querySelectorAll('.slide')
  const slide = slides?.[currentIndex.value]
  if (!slide) return null
  return slide.querySelector('video')
}

function detachVideoListeners(v) {
  if (!v) return
  v.removeEventListener('playing', onVideoPlaying)
  v.removeEventListener('pause', onVideoPause)
  v.removeEventListener('ended', onVideoEnded)
}

function stopCurrentVideo() {
  if (videoEl) {
    try { videoEl.pause() } catch {}
    detachVideoListeners(videoEl)
    videoEl = null
  }
}

function onVideoPlaying() {
  isPaused.value = true
}
function onVideoPause() {
  // 如果不是 ended 触发的暂停，保持暂停状态由用户控制
}
function onVideoEnded() {
  isPaused.value = false
  // 结束后切到下一张
  next()
}

async function handleSlideEnter() {
  // 如果是视频，尝试自动播放；否则恢复正常轮播
  const v = getCurrentVideo()
  if (v) {
    videoEl = v
    v.setAttribute('playsinline', '')
    v.setAttribute('webkit-playsinline', '')
    v.muted = true
    detachVideoListeners(v)
    v.addEventListener('playing', onVideoPlaying)
    v.addEventListener('pause', onVideoPause)
    v.addEventListener('ended', onVideoEnded)
    try { await v.play() } catch (e) { /* 移动端策略可能阻止，无需报错 */ }
  } else {
    // 图片则确保未处于强制暂停（除非预览/拖拽等）
    if (!previewVisible.value && !isDragging.value) {
      isPaused.value = false
    }
    // 重启计时器，确保严格的 3s 间隔
    startAutoplay()
  }
}

function onFullscreenChange() {
  // 进入全屏时暂停，退出全屏后恢复
  const fsEl = document.fullscreenElement || document.webkitFullscreenElement
  if (fsEl) {
    isPaused.value = true
  } else {
    if (!previewVisible.value && !isDragging.value) {
      isPaused.value = false
    }
  }
}

onMounted(() => {
  containerWidth.value = containerEl.value?.clientWidth || 1
  window.addEventListener('resize', () => {
    containerWidth.value = containerEl.value?.clientWidth || 1
  })
  document.addEventListener('visibilitychange', onVisibility)
  document.addEventListener('fullscreenchange', onFullscreenChange)
  document.addEventListener('webkitfullscreenchange', onFullscreenChange)
  // 首次进入时：根据首屏内容决定是否启动轮播
  isPaused.value = false
  handleSlideEnter()
  if (!getCurrentVideo()) {
    startAutoplay()
  } else {
    stopAutoplay()
  }
})

onBeforeUnmount(() => {
  stopAutoplay()
  document.removeEventListener('visibilitychange', onVisibility)
  document.removeEventListener('fullscreenchange', onFullscreenChange)
  document.removeEventListener('webkitfullscreenchange', onFullscreenChange)
  stopCurrentVideo()
})

watch(previewVisible, (v) => {
  // 预览打开期间不轮播
  isPaused.value = v
})

// 当 images 异步加载完成或数量变化时，初始化首屏并根据首帧类型启动/停止轮播
watch(count, (n, o) => {
  if (!n) return
  if (currentIndex.value >= n) currentIndex.value = 0
  // 如果页面隐藏，不做任何启动，待显示后再处理
  if (document.hidden) return
  // 初始化当前帧状态
  handleSlideEnter()
  // 首帧是图片则启动轮播；是视频则停止轮播（由视频驱动切换）
  if (!getCurrentVideo()) {
    isPaused.value = false
    startAutoplay()
  } else {
    stopAutoplay()
  }
})
</script>

<style scoped>
.carousel { position: relative; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 20px rgba(0,0,0,.1); }
.track { display: flex; width: 100%; }
.slide { min-width: 100%; user-select: none; }
.slide img, .carousel-video {
  width: 100%;
  aspect-ratio: 1/1;
  object-fit: cover;
  display: block;
  background: #f5ecc9;
  border-radius: 0;
}
.carousel-video {
  max-height: 100vw;
  background: #e6e3db;
}
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

