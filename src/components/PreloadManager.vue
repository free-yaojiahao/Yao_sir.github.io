<template>
  <div></div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'

// 预加载管理器
class PreloadManager {
  constructor() {
    this.cache = new Map()
    this.loading = new Set()
    this.maxConcurrent = this.computeConcurrency() // 最大并发预加载数量（网络自适应）
    this.currentLoading = 0
    this.queue = []
    this.idle = this.getIdleCallback()
  }

  computeConcurrency() {
    try {
      const conn = navigator.connection || navigator.webkitConnection || navigator.mozConnection
      if (conn?.saveData) return 1
      const et = conn?.effectiveType || ''
      if (et.includes('2g')) return 1
      if (et.includes('3g')) return 2
      return 4
    } catch { return 3 }
  }

  getIdleCallback() {
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      return window.requestIdleCallback.bind(window)
    }
    return (cb) => setTimeout(() => cb({ didTimeout: false, timeRemaining: () => 1 }), 300)
  }

  // 预加载单个资源
  async preloadResource(url, type = 'image') {
    if (this.cache.has(url)) {
      return this.cache.get(url)
    }

    if (this.loading.has(url)) {
      return new Promise((resolve) => {
        const checkLoaded = () => {
          if (this.cache.has(url)) {
            resolve(this.cache.get(url))
          } else {
            setTimeout(checkLoaded, 50)
          }
        }
        checkLoaded()
      })
    }

    return new Promise((resolve, reject) => {
      this.queue.push({ url, type, resolve, reject })
      this.processQueue()
    })
  }

  // 处理预加载队列
  processQueue() {
    if (this.currentLoading >= this.maxConcurrent || this.queue.length === 0) {
      return
    }

    // 简单优先级：高优先级靠前
    this.queue.sort((a, b) => (b.priority || 0) - (a.priority || 0))
    const { url, type, resolve, reject } = this.queue.shift()
    this.currentLoading++
    this.loading.add(url)

    const resource = type === 'image' ? new Image() : document.createElement('video')
    
    resource.onload = () => {
      this.cache.set(url, resource)
      this.loading.delete(url)
      this.currentLoading--
      resolve(resource)
      this.processQueue()
    }

    resource.onerror = () => {
      this.loading.delete(url)
      this.currentLoading--
      reject(new Error(`Failed to load ${url}`))
      this.processQueue()
    }

    // 设置预加载属性
    if (type === 'video') {
      // 更激进的预取，尽量把视频缓存在浏览器，缓解首播卡顿
      resource.preload = 'auto'
      resource.muted = true
      resource.playsInline = true
      try { resource.setAttribute('playsinline','') } catch {}
    }

    resource.src = url
    if (type === 'video' && resource.load) {
      try { resource.load() } catch {}
    }
  }

  // 批量预加载（低开销触发）
  preloadUrls(urls = [], { typeDetector, priority = 0 } = {}) {
    const detect = typeDetector || ((u) => (/\.(mp4|mov|webm)$/i.test(u) ? 'video' : 'image'))
    urls.forEach((u) => {
      if (!u) return
      if (this.cache.has(u) || this.loading.has(u)) return
      this.queue.push({ url: u, type: detect(u), resolve: () => {}, reject: () => {}, priority })
    })
    this.idle(() => this.processQueue())
  }

  // 预加载商品的所有资源
  async preloadItemResources(item) {
    if (!item || !item.images) return

    const promises = item.images.map(imageUrl => {
      const isVideo = /\.(mp4|mov|webm)$/i.test(imageUrl)
      return this.preloadResource(imageUrl, isVideo ? 'video' : 'image')
        .catch(err => console.warn(`预加载失败: ${imageUrl}`, err))
    })

    return Promise.allSettled(promises)
  }

  // 清理缓存
  clearCache() {
    this.cache.clear()
    this.loading.clear()
    this.queue = []
    this.currentLoading = 0
  }

  // 获取缓存统计
  getStats() {
    return {
      cached: this.cache.size,
      loading: this.loading.size,
      queued: this.queue.length
    }
  }
}

// 全局预加载管理器实例
const preloadManager = new PreloadManager()

export default {
  name: 'PreloadManager',
  setup() {
    const isVisible = ref(false)

    const startPreloading = () => {
      isVisible.value = true
    }

    const stopPreloading = () => {
      isVisible.value = false
    }

    onMounted(() => {
      // 监听页面可见性变化
      const handleVisibilityChange = () => {
        if (document.hidden) {
          stopPreloading()
        } else {
          startPreloading()
        }
      }

      document.addEventListener('visibilitychange', handleVisibilityChange)
      
      // 页面加载完成后开始预加载
      setTimeout(startPreloading, 600)

      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange)
      }
    })

    onUnmounted(() => {
      stopPreloading()
    })

    return {
      preloadManager,
      isVisible
    }
  }
}

// 导出预加载管理器实例
export { preloadManager }
</script>