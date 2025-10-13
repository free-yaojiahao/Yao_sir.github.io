<template>
  <div class="detail">
    <button class="back" @click="$router.back()">返回</button>
    <div class="carousel">
      <img :src="current" class="slide" />
      <div class="dots">
        <button 
          v-for="(img,idx) in item.images" :key="idx"
          :class="['dot',{active: idx===index}]"
          @click="index=idx" />
      </div>
    </div>
    <div class="info">
      <h2 class="title">{{ item.title }}</h2>
      <div class="row"><span>克重</span><b>{{ item.weight }} 克</b></div>
      <div class="row"><span>分类</span><b>{{ mapLabel(item.category) }}</b></div>
      <div class="row"><span>区域</span><b>{{ mapZone(item.zone) }}</b></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { goldItems, categories, zones } from '../data/gold'

const route = useRoute()
const item = goldItems.find(i => String(i.id) === String(route.params.id)) || goldItems[0]

const index = ref(0)
const current = computed(() => item.images[index.value])

const mapLabel = (val) => categories.find(c => c.value===val)?.label || val
const mapZone = (val) => zones.find(z => z.value===val)?.label || val
</script>

<style scoped>
.detail { display: grid; gap: 16px; }
.back { align-self: start; padding: 8px 12px; border-radius: 8px; border: 1px solid #e7d7a0; background: #fffaf0; color:#5a4a15; cursor: pointer; }
.carousel { position: relative; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 20px rgba(0,0,0,.1); }
.slide { width: 100%; aspect-ratio: 1/1; object-fit: cover; }
.dots { position: absolute; left: 0; right: 0; bottom: 8px; display: flex; justify-content: center; gap: 6px; }
.dot { width: 10px; height: 10px; border-radius: 50%; border: none; background: rgba(255,255,255,.6); cursor: pointer; }
.dot.active { background: #C89B3C; }
.info { background: white; border-radius: 12px; padding: 14px; box-shadow: 0 8px 20px rgba(0,0,0,.06); }
.title { margin-bottom: 8px; color:#3a2f0a; }
.row { display: flex; align-items: center; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #efdca4; }
.row:last-child { border-bottom: none; }
@media (min-width: 768px){ .detail { grid-template-columns: 1.2fr .8fr; align-items: start; } .slide { aspect-ratio: 4/3; } }
</style>


