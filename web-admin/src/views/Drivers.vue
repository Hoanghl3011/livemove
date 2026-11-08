<template>
  <div class="space-y-8 animate-fade-in text-gray-900">
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-3xl font-black tracking-tight">Quản lý Tài xế</h3>
        <p class="text-gray-400 text-sm mt-1">Lực lượng nòng cốt của Livemove</p>
      </div>
      <div class="flex space-x-4">
        <el-input 
          v-model="searchQuery" 
          placeholder="Tìm tên, số điện thoại..." 
          class="h-12 !rounded-2xl w-64 premium-search"
          :prefix-icon="Search"
        />
        <el-button 
          type="primary" 
          :icon="Plus" 
          class="!h-12 !px-6 !rounded-2xl !shadow-lg shadow-blue-500/30"
          @click="dialogVisible = true"
        >
          Thêm tài xế mới
        </el-button>
      </div>
    </div>

    <!-- Stats summary -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
       <div class="p-6 bg-white rounded-3xl shadow-premium flex items-center">
          <div class="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mr-4">
             <el-icon class="text-blue-600" :size="24"><User /></el-icon>
          </div>
          <div>
             <p class="text-xs text-gray-400 font-bold uppercase tracking-wider">Tổng số</p>
             <p class="text-xl font-black text-gray-900">{{ driverStore.drivers.length }}</p>
          </div>
       </div>
       <div class="p-6 bg-white rounded-3xl shadow-premium flex items-center">
          <div class="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center mr-4">
             <el-icon class="text-emerald-600" :size="24"><Check /></el-icon>
          </div>
          <div>
             <p class="text-xs text-gray-400 font-bold uppercase tracking-wider">Đang hoạt động</p>
             <p class="text-xl font-black -900">{{ onlineCount }}</p>
          </div>
       </div>
       <div class="p-6 bg-white rounded-3xl shadow-premium flex items-center border-l-4 border-l-blue-600">
          <div class="flex-1">
             <p class="text-xs text-gray-400 font-bold uppercase tracking-wider">Đội xe tiêu chuẩn</p>
             <p class="text-xl font-black">Premium Fleet</p>
          </div>
       </div>
    </div>

    <!-- Drivers Table -->
    <el-card shadow="never" class="!border-none !rounded-[40px] shadow-premium overflow-hidden">
      <el-table 
        :data="paginatedDrivers" 
        stripe 
        style="width: 100%" 
        class="premium-table"
        header-row-class-name="premium-table-header"
      >
        <el-table-column label="Tài xế" width="300">
          <template #default="{ row }">
            <div class="flex items-center space-x-4 py-2">
              <div class="relative">
                <el-avatar :size="48" :src="row.avatar || 'https://github.com/nutlope.png'" class="ring-4 ring-gray-50 shadow-md" />
                <div 
                  class="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white"
                  :class="row.isOnline ? 'bg-green-500' : 'bg-gray-300'"
                ></div>
              </div>
              <div>
                <p class="font-bold text-gray-900 text-sm leading-tight mb-1">{{ row.fullName }}</p>
                <div class="flex items-center text-[10px] text-gray-400 space-x-2">
                  <span class="flex items-center"><el-icon class="mr-0.5"><Iphone /></el-icon>{{ row.phone }}</span>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="Thông tin phương tiện" width="220">
          <template #default="{ row }">
             <p class="text-sm font-bold text-gray-800">{{ row.licensePlate }}</p>
             <p class="text-[10px] text-gray-400 uppercase tracking-widest">{{ row.vehicleType }}</p>
          </template>
        </el-table-column>

        <el-table-column prop="ordersCount" label="Đơn đã nhận" width="120" align="center">
           <template #default="{ row }">
              <el-tag size="small" type="info" class="!rounded-lg !border-none !font-bold">{{ row.ordersCount || 0 }} đơn</el-tag>
           </template>
        </el-table-column>

        <el-table-column prop="status" label="Trạng thái" width="160">
           <template #default="{ row }">
             <el-tag 
               :type="row.isOnline ? 'success' : 'info'" 
               size="small" 
               class="!rounded-xl !border-none !px-3 cursor-pointer hover:opacity-80 transition-opacity"
               effect="light"
               @click="driverStore.toggleStatus(row.id)"
             >
               {{ row.isOnline ? 'Online' : 'Offline' }}
             </el-tag>
           </template>
        </el-table-column>

        <el-table-column label="Thao tác" width="200" align="right">
          <template #default="{ row }">
             <div class="flex justify-end space-x-2">
                <el-button :icon="Edit" size="small" link class="!text-blue-600 font-bold hover:!opacity-70">Sửa</el-button>
                <el-button :icon="Delete" size="small" link class="!text-rose-500 font-bold hover:!opacity-70" @click="handleDelete(row)">Xóa</el-button>
             </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination -->
      <div class="mt-10 px-6 py-4 bg-gray-50 flex justify-between items-center rounded-2xl">
         <span class="text-xs text-gray-400 font-bold">Hiển thị {{ paginatedDrivers.length }} / {{ filteredDrivers.length }} tài xế</span>
         <el-pagination 
           background 
           layout="prev, pager, next" 
           :total="filteredDrivers.length" 
           v-model:current-page="currentPage"
           :page-size="pageSize"
           class="premium-pagination"
         />
      </div>
    </el-card>

    <!-- Create Driver Dialog -->
    <el-dialog 
      v-model="dialogVisible" 
      title="Khởi tạo tài xế mới" 
      width="550px" 
      custom-class="premium-dialog rounded-[32px] overflow-hidden"
    >
      <el-form :model="driverForm" label-position="top" class="p-4 space-y-4">
        <el-form-item label="Họ và tên">
          <el-input v-model="driverForm.fullName" placeholder="VD: Nguyễn Văn A" class="h-12 !rounded-xl" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Số điện thoại / Username">
              <el-input v-model="driverForm.phone" placeholder="090... hoặc email" class="h-12 !rounded-xl" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Mật khẩu đăng nhập">
              <el-input v-model="driverForm.password" type="password" placeholder="Min 6 ký tự" class="h-12 !rounded-xl" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
           <el-col :span="12">
             <el-form-item label="Biển số xe">
               <el-input v-model="driverForm.licensePlate" placeholder="59A-..." class="h-12 !rounded-xl" />
             </el-form-item>
           </el-col>
           <el-col :span="12">
             <el-form-item label="Loại phương tiện">
               <el-select v-model="driverForm.vehicleType" class="w-full h-12 !rounded-xl">
                  <el-option label="Honda Winner X" value="Honda Winner X" />
                  <el-option label="Yamaha Exciter" value="Yamaha Exciter" />
                  <el-option label="Honda AirBlade" value="Honda AirBlade" />
                  <el-option label="Suzuki Raider" value="Suzuki Raider" />
               </el-select>
             </el-form-item>
           </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="flex items-center justify-end space-x-4 p-4 mt-4 border-t border-gray-50">
           <el-button @click="dialogVisible = false" class="!border-none !text-gray-400 font-bold hover:!text-gray-600">Hủy bỏ</el-button>
           <el-button 
             type="primary" 
             @click="handleAddDriver" 
             :loading="submitting"
             class="!h-12 !px-8 !rounded-xl !shadow-lg shadow-blue-500/20"
           >
             Khởi tạo ngay
           </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch, onMounted } from 'vue';
import { Plus, Edit, Delete, User, Check, Iphone, Search } from '@element-plus/icons-vue';
import { useDriverStore } from '../stores/driverStore';
import { ElMessage, ElMessageBox } from 'element-plus';

const driverStore = useDriverStore();
const dialogVisible = ref(false);
const submitting = ref(false);
const searchQuery = ref('');

// Pagination
const currentPage = ref(1);
const pageSize = ref(4);

onMounted(() => {
    driverStore.fetchDrivers();
});

const onlineCount = computed(() => driverStore.drivers.filter(d => d.isOnline).length);

const filteredDrivers = computed(() => {
  return driverStore.drivers.filter(driver => {
    return driver.fullName.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
           driver.phone.includes(searchQuery.value);
  });
});

const paginatedDrivers = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredDrivers.value.slice(start, end);
});

// Reset page on search
watch(searchQuery, () => {
  currentPage.value = 1;
});

const driverForm = reactive({
  fullName: '',
  phone: '',
  password: '',
  licensePlate: '',
  vehicleType: 'Honda Winner X'
});

const handleAddDriver = async () => {
    if (!driverForm.fullName || !driverForm.phone || !driverForm.password) {
        ElMessage.warning('Vui lòng điền đầy đủ thông tin (Tên, SĐT, Mật khẩu)');
        return;
    }
    
    submitting.value = true;
    try {
        await driverStore.addDriver({ ...driverForm });
        ElMessage.success('Khởi tạo tài xế thành công');
        dialogVisible.value = false;
        
        // Reset form
        driverForm.fullName = '';
        driverForm.phone = '';
        driverForm.password = '';
        driverForm.licensePlate = '';
    } catch (err: any) {
        console.error('Add driver error:', err);
        const errorMsg = err.response?.data?.message || 'Không thể tạo tài xế. Vui lòng kiểm tra lại thông tin.';
        ElMessage.error(Array.isArray(errorMsg) ? errorMsg[0] : errorMsg);
    } finally {
        submitting.value = false;
    }
};

const handleDelete = (row: any) => {
    ElMessageBox.confirm(
        `Bạn có chắc chắn muốn xóa tài xế ${row.fullName}?`,
        'Cảnh báo',
        {
          confirmButtonText: 'Xóa',
          cancelButtonText: 'Hủy',
          type: 'warning',
          confirmButtonClass: '!bg-rose-500 !border-none',
          cancelButtonClass: '!text-gray-400 !border-none'
        }
    ).then(async () => {
        try {
            await driverStore.deleteDriver(row.id);
            ElMessage.success('Đã xóa tài xế');
        } catch (err) {
            ElMessage.error('Không thể xóa tài xế');
        }
    });
};
</script>

<style scoped>
:deep(.premium-table-header th) {
   background-color: transparent !important;
   color: #94a3b8 !important;
   font-size: 11px !important;
   font-weight: 800 !important;
   text-transform: uppercase !important;
   letter-spacing: 0.1em !important;
   border-bottom: 1px solid #f1f5f9 !important;
}

:deep(.el-pagination.is-background .el-pager li:not(.is-active)) {
    background-color: transparent !important;
}

:deep(.premium-search .el-input__wrapper) {
   box-shadow: 0 4px 12px rgba(0,0,0,0.03) !important;
   border: none !important;
   border-radius: 20px !important;
   padding: 0 20px !important;
}
</style>
