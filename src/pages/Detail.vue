<template>
  <div class="detail">
    <button class="back" @click="$router.back()">返回</button>
    <Carousel :images="item.images" :autoplay="true" :interval="3000" />
    <div class="info">
      <h2 class="title">{{ item.title }}</h2>
      <div class="row"><span>克重</span><b>{{ item.weight }} 克</b></div>
      <div class="row"><span>分类</span><b>{{ mapLabel(item.category) }}</b></div>
      <div class="row"><span>区域</span><b>{{ mapZone(item.zone) }}</b></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Carousel from '../components/Carousel.vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const item = ref({ title: '', weight: 0, images: [], category: '', zone: '' })
const categoriesRef = ref([])
const zonesRef = ref([])

const mapLabel = (val) => categoriesRef.value.find(c => c.value===val)?.label || val
const mapZone = (val) => zonesRef.value.find(z => z.value===val)?.label || val

onMounted(async () => {
  const res = await fetch('/gold-data.json', { cache: 'no-store' })
  const data = await res.json()
  categoriesRef.value = data.categories || []
  zonesRef.value = data.zones || []
  const list = (data.goldItems || []).map((it, idx) => ({ id: it.id ?? (idx + 1), ...it }))
  item.value = list.find(i => String(i.id) === String(route.params.id)) || list[0] || item.value
})
</script>

<style scoped>
.detail { display: grid; gap: 16px; }
.back { align-self: start; padding: 8px 12px; border-radius: 8px; border: 1px solid #e7d7a0; background: #fffaf0; color:#5a4a15; cursor: pointer; width: 100%; }
.carousel { position: relative; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 20px rgba(0,0,0,.1); }
.slide { width: 100%; aspect-ratio: 1/1; object-fit: cover; }
.dots { position: absolute; left: 0; right: 0; bottom: 8px; display: flex; justify-content: center; gap: 6px; }
.dot { width: 10px; height: 10px; border-radius: 50%; border: none; background: rgba(255,255,255,.6); cursor: pointer; }
.dot.active { background: #C89B3C; }
.info { background: white; border-radius: 12px; padding: 14px; box-shadow: 0 8px 20px rgba(0,0,0,.06); }
.title { margin-bottom: 8px; color:#3a2f0a; }
.row { display: flex; align-items: center; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #efdca4; }
.row:last-child { border-bottom: none; }
/* 居中单列容器：在较宽屏幕两侧留白 */
@media (min-width: 1024px){ .detail { max-width: 980px; margin: 0 auto; } }
</style>


