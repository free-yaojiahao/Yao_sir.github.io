<template>
  <div class="container">
    <header>
      <h1>🌟 精品商城</h1>
      <p class="subtitle">发现优质商品，享受美好生活</p>
    </header>

    <div class="category-section">
      <h2 class="category-title">🔥 热门商品</h2>
      <div class="products-grid">
        <ProductCard 
          v-for="product in hotProducts" 
          :key="product.id"
          :product="product"
          @add-to-cart="handleAddToCart"
        />
      </div>
    </div>

    <div class="category-section">
      <h2 class="category-title">🏠 家居生活</h2>
      <div class="products-grid">
        <ProductCard 
          v-for="product in homeProducts" 
          :key="product.id"
          :product="product"
          @add-to-cart="handleAddToCart"
        />
      </div>
    </div>

    <div class="category-section">
      <h2 class="category-title">👕 时尚服饰</h2>
      <div class="products-grid">
        <ProductCard 
          v-for="product in fashionProducts" 
          :key="product.id"
          :product="product"
          @add-to-cart="handleAddToCart"
        />
      </div>
    </div>

    <div class="stats">
      <div class="stat-card">
        <div class="stat-number">10,000+</div>
        <div class="stat-label">满意客户</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">500+</div>
        <div class="stat-label">精选商品</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">99%</div>
        <div class="stat-label">好评率</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">24/7</div>
        <div class="stat-label">客服支持</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ProductCard from './components/ProductCard.vue'

// 商品数据
const hotProducts = ref([
  {
    id: 1,
    title: '智能手机 Pro Max',
    description: '最新款智能手机，配备先进摄像头系统和超长续航电池，为您带来极致体验。',
    price: 6999,
    originalPrice: 8999,
    image: '📱',
    badge: { type: 'hot', text: '热销' }
  },
  {
    id: 2,
    title: '超薄笔记本电脑',
    description: '轻薄便携，性能强劲，适合商务办公和娱乐使用，让工作更高效。',
    price: 9999,
    originalPrice: 12999,
    image: '💻',
    badge: { type: 'new', text: '新品' }
  },
  {
    id: 3,
    title: '无线降噪耳机',
    description: '专业级降噪技术，音质清晰，佩戴舒适，让您沉浸在音乐世界中。',
    price: 1999,
    originalPrice: 2999,
    image: '🎧',
    badge: { type: 'sale', text: '特价' }
  }
])

const homeProducts = ref([
  {
    id: 4,
    title: '舒适沙发套装',
    description: '精选优质面料，人体工学设计，为您的客厅增添温馨舒适的氛围。',
    price: 3999,
    originalPrice: null,
    image: '🛋️',
    badge: null
  },
  {
    id: 5,
    title: '智能咖啡机',
    description: '一键制作专业级咖啡，多种口味选择，让您在家也能享受咖啡厅的品质。',
    price: 1599,
    originalPrice: null,
    image: '☕',
    badge: { type: 'new', text: '新品' }
  },
  {
    id: 6,
    title: '智能空气净化器',
    description: '高效过滤PM2.5，智能监测空气质量，为家人创造健康呼吸环境。',
    price: 2299,
    originalPrice: null,
    image: '🌱',
    badge: null
  }
])

const fashionProducts = ref([
  {
    id: 7,
    title: '商务正装套装',
    description: '精选面料，剪裁精良，展现专业形象，适合商务场合穿着。',
    price: 899,
    originalPrice: 1299,
    image: '👔',
    badge: { type: 'sale', text: '特价' }
  },
  {
    id: 8,
    title: '运动休闲鞋',
    description: '舒适透气，时尚百搭，适合日常运动和休闲穿着，让脚步更轻松。',
    price: 599,
    originalPrice: null,
    image: '👟',
    badge: null
  },
  {
    id: 9,
    title: '时尚手提包',
    description: '经典设计，优质皮革，大容量收纳，是您日常出行的完美伴侣。',
    price: 799,
    originalPrice: null,
    image: '👜',
    badge: { type: 'new', text: '新品' }
  }
])

// 处理添加到购物车
const handleAddToCart = (product) => {
  console.log('添加到购物车:', product.title)
  // 这里可以添加实际的购物车逻辑
}
</script>
