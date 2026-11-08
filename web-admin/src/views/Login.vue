<template>
  <div class="min-h-screen w-full flex items-center justify-center bg-[#0f172a] relative overflow-hidden">
    <!-- Abstract Background Orbs -->
    <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px]"></div>
    <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px]"></div>

    <div class="w-full max-w-[480px] z-10 px-6">
      <div class="bg-white/80 backdrop-blur-2xl rounded-[48px] shadow-2xl overflow-hidden p-12 border border-white/20">
        <div class="text-center mb-12">
          <div class="w-20 h-20 bg-blue-600 rounded-[28px] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-500/40 rotate-3">
            <el-icon :size="40" color="white"><Truck /></el-icon>
          </div>
          <h1 class="text-3xl font-black text-gray-900 tracking-tight">Chào mừng quay lại!</h1>
          <p class="text-gray-500 mt-3 text-sm font-medium">Hệ thống điều vận Livemove Fleet</p>
        </div>

        <el-form :model="loginForm" label-position="top" class="space-y-6">
          <el-form-item>
            <template #label>
               <span class="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Email công ty</span>
            </template>
            <el-input 
              v-model="loginForm.email" 
              placeholder="admin@livemove.vn" 
              class="premium-input"
            >
              <template #prefix><el-icon class="ml-2"><Message /></el-icon></template>
            </el-input>
          </el-form-item>

          <el-form-item>
            <template #label>
               <span class="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Mật khẩu</span>
            </template>
            <el-input 
              v-model="loginForm.password" 
              type="password" 
              placeholder="••••••••" 
              show-password 
              class="premium-input"
            >
               <template #prefix><el-icon class="ml-2"><Lock /></el-icon></template>
            </el-input>
          </el-form-item>
          
          <div class="flex items-center justify-between mb-8 px-1">
            <el-checkbox label="Duy trì" class="!text-xs !font-bold text-gray-500" />
            <el-link type="primary" :underline="false" class="!text-xs !font-extrabold">Quên mật khẩu?</el-link>
          </div>

          <el-button 
              type="primary" 
              class="w-full !h-16 !text-lg !font-black !rounded-[24px] !shadow-xl shadow-blue-500/30 transition-all hover:scale-[1.02] active:scale-95" 
              :loading="loading"
              @click="handleLogin"
          >
            Đăng nhập hệ thống
          </el-button>
        </el-form>

        <div class="mt-12 text-center">
          <p class="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">© 2026 Livemove Premium Fleet Platform</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/api';
import { ElMessage } from 'element-plus';

const router = useRouter();
const loading = ref(false);

const loginForm = reactive({
  email: 'admin@livemove.com',
  password: 'Admin@123456'
});

const handleLogin = async () => {
  loading.value = true;
  try {
    const res = await api.post('/auth/login', {
        email: loginForm.email,
        password: loginForm.password
    });
    
    if (res.data && res.data.access_token) {
        localStorage.setItem('token', res.data.access_token);
        if (res.data.refresh_token) {
            localStorage.setItem('refresh_token', res.data.refresh_token);
        }
        router.push('/');
    }
  } catch (error: any) {
    console.error('Login error:', error);
    if (error.code === 'ERR_NETWORK') {
        ElMessage.error('Không thể kết nối đến máy chủ. Vui lòng đảm bảo Backend đang chạy ở cổng 3000.');
    } else {
        ElMessage.error(error.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại email/mật khẩu.');
    }
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
:deep(.premium-input .el-input__wrapper) {
  border-radius: 20px !important;
  height: 56px !important;
  background: white !important;
  border: 1px solid #f1f5f9 !important;
  box-shadow: 0 4px 12px rgba(0,0,0,0.02) !important;
  padding-left: 12px !important;
}

:deep(.premium-input .el-input__inner) {
  font-weight: 600;
  color: #1e293b;
}

:deep(.el-form-item__label) {
   margin-bottom: 8px !important;
}
</style>
