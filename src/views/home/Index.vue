<template>
  <div class="home-container">
    <!-- 欢迎横幅 -->
    <div class="welcome-banner">
      <div class="banner-content">
        <h1 class="platform-title">代练侠 - 专业游戏代练平台</h1>
        <p class="platform-subtitle">
          连接玩家与代练师，提供安全、高效的游戏代练服务
        </p>
      </div>
      <div class="banner-stats">
        <div class="stat-item">
          <div class="stat-number">10,000+</div>
          <div class="stat-label">注册用户</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">500+</div>
          <div class="stat-label">专业代练师</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">50,000+</div>
          <div class="stat-label">完成订单</div>
        </div>
      </div>
    </div>

    <!-- 热门游戏 -->
    <el-card class="section-card">
      <template #header>
        <div class="card-header">
          <h3>热门游戏</h3>
          <el-button type="text">查看更多</el-button>
        </div>
      </template>
      <el-row :gutter="16">
        <el-col :span="6" v-for="game in hotGames" :key="game.id">
          <div class="game-card">
            <img :src="game.icon" :alt="game.name" class="game-icon" />
            <div class="game-info">
              <h4>{{ game.name }}</h4>
              <p class="game-orders">{{ game.orderCount }}+ 订单</p>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// 热门游戏数据
const hotGames = ref([
  {
    id: 1,
    name: '王者荣耀',
    icon: 'https://game-boosting.oss-cn-guangzhou.aliyuncs.com/games/wzry.png',
    orderCount: 15000,
  },
  {
    id: 2,
    name: '英雄联盟',
    icon: 'https://game-boosting.oss-cn-guangzhou.aliyuncs.com/games/lol.png',
    orderCount: 12000,
  },
  {
    id: 3,
    name: '原神',
    icon: 'https://game-boosting.oss-cn-guangzhou.aliyuncs.com/games/ys.png',
    orderCount: 8000,
  },
  {
    id: 4,
    name: '和平精英',
    icon: 'https://game-boosting.oss-cn-guangzhou.aliyuncs.com/games/hpjy.png',
    orderCount: 10000,
  },
])

console.log('首页组件已加载')
</script>

<style scoped>
.home-container {
  padding: 20px;
}

.welcome-banner {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 40px;
  color: white;
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.platform-title {
  font-size: 32px;
  font-weight: bold;
  margin: 0 0 12px 0;
}

.platform-subtitle {
  font-size: 16px;
  opacity: 0.9;
  margin: 0;
}

.banner-stats {
  display: flex;
  gap: 40px;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  opacity: 0.8;
}

.section-card {
  margin-bottom: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.game-card {
  display: flex;
  align-items: center;
  padding: 16px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  transition: all 0.3s;
  cursor: pointer;
}

.game-card:hover {
  border-color: #409eff;
  box-shadow: 0 2px 12px rgba(64, 158, 255, 0.1);
}

.game-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  margin-right: 12px;
}

.game-info h4 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
}

.game-orders {
  margin: 0;
  font-size: 14px;
  color: #909399;
}
</style>
