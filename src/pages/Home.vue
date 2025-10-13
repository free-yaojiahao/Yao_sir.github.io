<template>
  <div class="gold-home">
    <div class="tabs">
      <button 
        v-for="z in zones" :key="z.value" 
        :class="['tab', { active: zone===z.value }]" 
        @click="zone=z.value">
        {{ z.label }}
      </button>
    </div>

    <div class="categories">
      <button 
        v-for="c in categories" :key="c.value"
        :class="['chip', { active: category===c.value }]"
        @click="category=c.value">
        {{ c.label }}
      </button>
    </div>

    <div class="grid">
      <div 
        class="item-card" 
        v-for="it in filtered" :key="it.id"
        @click="goDetail(it)">
        <img class="thumb" :src="it.images[0]" :alt="it.title" />
        <div class="meta">
          <div class="title">{{ it.title }}</div>
          <div class="weight">{{ it.weight }} 克</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { goldItems, zones as zonesDef, categories as categoriesDef } from '../data/gold'

const router = useRouter()

const zones = zonesDef
const categories = categoriesDef

const zone = ref(zones[0].value)
const category = ref(categories[0].value)

const filtered = computed(() => {
  return goldItems.filter(i => i.zone === zone.value && i.category === category.value)
})

const goDetail = (item) => {
  router.push({ name: 'detail', params: { id: item.id } })
}
</script>

<style scoped>
.tabs { display: flex; gap: 8px; margin-bottom: 12px; flex-wrap: wrap; }
.tab { padding: 10px 14px; border-radius: 999px; border: none; cursor: pointer; background: #f2e6c8; color: #5a4a15; font-weight: 700; }
.tab.active { background: linear-gradient(90deg,#C89B3C,#9C7C2D); color: #2b2100; }
.categories { display: flex; gap: 8px; margin: 8px 0 16px; flex-wrap: wrap; }
.chip { padding: 8px 12px; border-radius: 999px; border: 1px solid #e7d7a0; background: rgba(200,155,60,.12); color:#5a4a15; cursor: pointer; }
.chip.active { background: rgba(200,155,60,.28); border-color: #C89B3C; }
.grid { display: grid; grid-template-columns: repeat(auto-fit,minmax(140px,1fr)); gap: 12px; }
.item-card { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 20px rgba(0,0,0,.08); cursor: pointer; display: flex; flex-direction: column; }
.thumb { width: 100%; aspect-ratio: 1/1; object-fit: cover; }
.meta { padding: 10px; display: flex; align-items: center; justify-content: space-between; }
.title { font-weight: 700; color: #3a2f0a; font-size: .95rem; }
.weight { color: #7a6a30; font-size: .9rem; }
@media (min-width: 768px){ .grid { grid-template-columns: repeat(auto-fit,minmax(220px,1fr)); gap: 16px; } }
</style>


