<template>
  <div class="site-shell">
    <header class="site-header">
      <div class="brand">黄金饰品</div>
    </header>

    <main class="site-main">
      <router-view />
    </main>

    <footer class="site-footer">© 铭心珠宝 - 黄金饰品展示</footer>
  </div>
  
</template>

<script setup>
import PreloadManager from './components/PreloadManager.vue'
import { onMounted } from 'vue'
import { preloadManager } from './components/PreloadManager.vue'

onMounted(async () => {
  try {
    const res = await fetch('/gold-data.json', { cache: 'force-cache' })
    const data = await res.json()
    const items = (data.goldItems || [])

    // 全局温加载：各区前若干条的首要媒体
    const topPerZone = 6
    const zones = (data.zones || []).map(z => z.value)
    const urls = []
    zones.forEach(z => {
      let picked = 0
      for (const it of items) {
        if (it.zone !== z) continue
        if (picked >= topPerZone) break
        if (it.images && it.images.length) {
          urls.push(it.images[0]) // 第一媒体优先
          // 同时轻量预取第二媒体（若存在）
          if (it.images[1]) urls.push(it.images[1])
          picked++
        }
      }
    })
    preloadManager.preloadUrls(urls, { priority: 1 })
  } catch {}
})
</script>

<style scoped>
.site-shell { min-height: 100vh; display: flex; flex-direction: column; }
.site-header { 
  display: flex; align-items: center; justify-content: center; 
  padding: 12px 20px; background: linear-gradient(90deg,#C89B3C,#9C7C2D); color: #2b2100;
  position: sticky; top: 0; z-index: 10; box-shadow: 0 6px 16px rgba(0,0,0,0.15);
}
.brand { font-weight: 800; letter-spacing: 1px; font-size: 1.12rem; }
@media (max-width: 520px) {
  .site-header { flex-direction: column; align-items: flex-start; padding: 12px 10px; }
  .brand { font-size: 1.08rem; }
  .nav { width: 100%; margin-top: 6px; justify-content: flex-start; }
}
.nav-link { color: #2b2100; text-decoration: none; font-weight: 600; }
.nav-link.router-link-active { text-decoration: underline; }
.site-main { flex: 1; padding: 16px; padding-top: 0px; }
.site-footer { text-align: center; padding: 16px; color: #5a4a15; background: rgba(200,155,60,0.1); }
@media (min-width: 768px) { .site-main { padding: 24px; } }
</style>
