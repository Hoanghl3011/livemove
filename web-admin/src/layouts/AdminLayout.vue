<template>
  <el-container class="min-h-screen bg-[#f8fafc]">
    <!-- Sidebar -->
    <el-aside width="280px" class="glass-dark border-none hidden lg:block overflow-x-hidden transition-all duration-300">
      <div class="flex items-center px-8 py-10">
        <div class="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center mr-3 shadow-lg shadow-blue-500/40">
           <el-icon :size="24" color="white"><Truck /></el-icon>
        </div>
        <span class="text-xl font-extrabold text-white tracking-tight">Livemove <span class="text-blue-400">Admin</span></span>
      </div>

      <el-menu
        :default-active="activeMenu"
        class="el-menu-vertical border-none"
        text-color="rgba(255,255,255,0.7)"
        active-text-color="#ffffff"
        router
      >
        <el-menu-item index="/">
          <el-icon><DataBoard /></el-icon>
          <span>Tổng quan</span>
        </el-menu-item>
        <el-menu-item index="/fleet-map">
          <el-icon><Location /></el-icon>
          <span>Bản đồ trực tuyến</span>
        </el-menu-item>
        <el-menu-item index="/orders">
          <el-icon><Document /></el-icon>
          <span>Quản lý đơn hàng</span>
        </el-menu-item>
        <el-menu-item index="/drivers">
          <el-icon><User /></el-icon>
          <span>Quản lý tài xế</span>
        </el-menu-item>
        
        <div class="px-8 mt-10 mb-4 uppercase text-xs font-bold text-gray-500 tracking-widest">Hệ thống</div>
        
        <el-menu-item index="/settings">
          <el-icon><Setting /></el-icon>
          <span>Cài đặt</span>
        </el-menu-item>
      </el-menu>

      <!-- Sidebar Footer Card -->
      <div class="absolute bottom-10 left-6 right-6 p-6 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl shadow-xl shadow-blue-900/40 overflow-hidden">
         <div class="relative z-10">
            <p class="text-white font-bold mb-1">Cần hỗ trợ?</p>
            <p class="text-blue-100 text-xs mb-4">Hệ thống hỗ trợ 24/7</p>
            <el-button size="small" class="w-full !rounded-xl !bg-white/20 !border-none !text-white hover:!bg-white/30">Liên hệ ngay</el-button>
         </div>
      </div>
    </el-aside>

    <el-container class="flex-col">
      <!-- Header -->
      <el-header class="h-20 glass flex items-center justify-between px-8 !sticky top-0 z-50">
        <div class="flex items-center">
            <el-button link class="lg:hidden mr-4">
                <el-icon :size="24"><Menu /></el-icon>
            </el-button>
            <h2 class="text-lg font-bold text-gray-800">Hệ thống điều phối đội xe</h2>
        </div>
        
        <div class="flex items-center space-x-6">
          <el-badge :value="3" class="item">
            <el-button link>
               <el-icon :size="20"><Bell /></el-icon>
            </el-button>
          </el-badge>
          
          <div class="h-10 w-[1px] bg-gray-200"></div>
          
          <el-dropdown trigger="click">
            <div class="flex items-center cursor-pointer group">
              <div class="mr-3 text-right">
                <p class="text-sm font-bold text-gray-800 group-hover:text-blue-600">Admin Livemove</p>
                <p class="text-[10px] text-gray-400">Supper Admin</p>
              </div>
              <el-avatar size="small" :src="'https://github.com/nutlope.png'" class="border-2 border-white shadow-sm" />
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item><el-icon><User /></el-icon> Hồ sơ</el-dropdown-item>
                <el-dropdown-item divided type="danger" @click="handleLogout">
                  <el-icon><SwitchButton /></el-icon> Đăng xuất
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- Main Content -->
      <el-main class="p-8">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { 
  Van as Truck, DataBoard, Location, Document, User, Setting, Bell, 
  Menu, SwitchButton 
} from '@element-plus/icons-vue';

const route = useRoute();
const router = useRouter();

const activeMenu = computed(() => route.path);

const handleLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refresh_token');
  router.push('/login');
};
</script>

<style scoped>
.glass-dark {
  background: #0f172a;
  box-shadow: 10px 0 30px -10px rgba(0,0,0,0.2);
}

:deep(.el-menu-item) {
  font-weight: 500;
  transition: all 0.3s ease;
}

:deep(.el-menu-item .el-icon) {
  margin-right: 12px;
  font-size: 18px;
}
</style>
