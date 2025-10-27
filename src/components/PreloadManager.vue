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
    this.maxConcurrent = 3 // 最大并发预加载数量
    this.currentLoading = 0
    this.queue = []
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
      resource.preload = 'metadata'
      resource.muted = true
    }

    resource.src = url
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
      setTimeout(startPreloading, 1000)

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