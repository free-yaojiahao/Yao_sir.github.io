<template>
  <div class="gold-home">
    <div class="welcome-title">欢迎进入铭心珠宝（尧水明金店）</div>
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
        v-for="it in paged" :key="it.id"
        @click="goDetail(it)">
        <img class="thumb" :src="it.images[0]" :alt="it.title" />
        <!-- <div class="meta">
          <div class="title">{{ it.title }}</div>
          <div class="weight">{{ it.weight }} 克</div>
        </div> -->
      </div>
    </div>
    <div v-if="filtered.length === 0" class="empty">敬请期待</div>
    <div v-else-if="paged.length < filtered.length" class="empty">正在加载更多…</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onUnmounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
// 直接从 public/gold-data.json 拉取

const router = useRouter()
const route = useRoute()

const zones = ref([])
const categories = ref([])
const items = ref([])

const zone = ref('')
const category = ref('')

const PER_PAGE = 12
const page = ref(1)

const filtered = computed(() => {
  return items.value.filter(i => {
    if (i.zone !== zone.value) return false
    if (category.value === 'all') return true
    return i.category === category.value
  })
})
const paged = computed(() => filtered.value.slice(0, page.value * PER_PAGE))

const getScrollTop = () => Math.max(window.scrollY, document.documentElement.scrollTop, document.body.scrollTop)
const setScrollTop = (val=0) => {
  window.scrollTo(0, val)
  document.documentElement.scrollTop = val
  document.body.scrollTop = val
}
const SCROLL_KEY = 'gold_scroll_top'
const restoreScroll = () => {
  const last = parseInt(sessionStorage.getItem(SCROLL_KEY) || '0', 10)
  nextTick(() => {
    setTimeout(() => setScrollTop(last), 40)
  })
}

const goDetail = (item) => {
  sessionStorage.setItem(SCROLL_KEY, String(getScrollTop()))
  router.push({ name: 'detail', params: { id: item.id } })
}

function onScroll() {
  const el = document.documentElement
  if (el.scrollTop + window.innerHeight + 80 >= el.scrollHeight && paged.value.length < filtered.value.length) {
    page.value++
  }
}

const ZONE_KEY = 'gold_zone'
const CAT_KEY = 'gold_cat'

onMounted(async () => {
  const res = await fetch('/gold-data.json', { cache: 'no-store' })
  const data = await res.json()
  zones.value = data.zones || []
  categories.value = [{ label: '所有', value: 'all' }, ...(data.categories || [])]
  const raw = data.goldItems || []
  items.value = raw.map((it, idx) => ({ id: it.id ?? (idx + 1), ...it }))

  // 恢复zone和category选择
  const queryZone = route.query.zone
  const queryCat = route.query.category
  const lastZone = (typeof queryZone === 'string' && queryZone) || sessionStorage.getItem(ZONE_KEY) || zones.value[0]?.value || ''
  const lastCat = (typeof queryCat === 'string' && queryCat) || sessionStorage.getItem(CAT_KEY) || 'all'
  zone.value = lastZone; category.value = lastCat

  window.addEventListener('scroll', onScroll)
  // 页面加载完恢复滚动
  setTimeout(restoreScroll, 200)
})

// 切换区/类别时重置分页
function resetPage() { page.value = 1 }

watch([zone, category], resetPage)

watch(zone, z => sessionStorage.setItem(ZONE_KEY, z))
watch(category, c => sessionStorage.setItem(CAT_KEY,c))

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})
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
.empty { text-align: center; padding: 24px; color: #7a6a30; }
.welcome-title {
  margin-bottom: 10px;
  margin-top: 2px;
  font-size: 1.16rem;
  text-align: center;
  color: #7B430D;
  font-weight: 800;
  letter-spacing: 2px;
  background: linear-gradient(90deg,#ffedb3 0%,#ffe6b0 50%,#fff6de 99%);
  border-radius: 12px;
  border: 1.5px solid #edce83;
  box-shadow: 0 2px 10px rgba(160,130,40,0.08) inset,0 2px 8px rgba(200,155,60,0.06);
  padding: 11px 8px 10px 8px;
  opacity: 0.98;
  text-shadow: 0px 2px 10px #fff6de, 0px 1px 2px #e7bb59;
  position: relative;
}
.welcome-title::before,
.welcome-title::after {
  content: '';
  display: block;
  height: 3px;
  width: 40%;
  margin: 0 auto 6px auto;
  border-radius: 1.5px;
  background: linear-gradient(90deg,#efd684,#ffe6b0 60%,#f3db80 99%);
}
.welcome-title::before { margin-bottom:-7px; margin-top: -2px; }
.welcome-title::after { margin-top:-8px; margin-bottom: 3px; }
@media (min-width: 768px){ .grid { grid-template-columns: repeat(auto-fit,minmax(220px,1fr)); gap: 16px; } }
@media (max-width: 700px) {
  .welcome-title {
    font-size: 1.02rem;
    padding: 7px 3px 7px 3px;
    margin-bottom: 7px;
    margin-top: 1px;
    letter-spacing: 2px;
  }
  .welcome-title::before, .welcome-title::after {
    height: 2px;
    width: 38%;
    margin-bottom: 3px;
    margin-top: 2px;
  }
}
</style>


