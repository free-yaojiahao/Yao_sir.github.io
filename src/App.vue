<template>
  <div class="site-shell">
    <header class="site-header">
      <div class="brand">黄金饰品</div>
      <nav class="nav">
        <router-link to="/" class="nav-link">首页</router-link>
      </nav>
    </header>

    <main class="site-main">
      <router-view />
    </main>

    <footer class="site-footer">© 2025 黄金饰品展示</footer>
  </div>
  
</template>

<script setup>
// 空：壳组件仅承载路由视图
</script>

<style scoped>
.site-shell { min-height: 100vh; display: flex; flex-direction: column; }
.site-header { 
  display: flex; align-items: center; justify-content: space-between; 
  padding: 12px 20px; background: linear-gradient(90deg,#C89B3C,#9C7C2D); color: #2b2100;
  position: sticky; top: 0; z-index: 10; box-shadow: 0 6px 16px rgba(0,0,0,0.15);
}
.brand { font-weight: 800; letter-spacing: 1px; }
.nav-link { color: #2b2100; text-decoration: none; font-weight: 600; }
.nav-link.router-link-active { text-decoration: underline; }
.site-main { flex: 1; padding: 16px; }
.site-footer { text-align: center; padding: 16px; color: #5a4a15; background: rgba(200,155,60,0.1); }
@media (min-width: 768px) { .site-main { padding: 24px; } }
</style>
