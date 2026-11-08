<template>
  <div class="space-y-8 animate-fade-in">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-3xl font-black text-gray-900 tracking-tight">Quản lý Đơn hàng</h3>
        <p class="text-gray-400 text-sm mt-1">Theo dõi và điều phối vận chuyển toàn hệ thống</p>
      </div>
      <div class="flex space-x-4">
        <el-button 
          class="!h-12 !px-6 !rounded-2xl !bg-white !border-gray-100 !text-gray-600 font-bold shadow-sm hover:!border-blue-200"
          :icon="Download"
        >
          Xuất báo cáo
        </el-button>
        <el-button 
          type="primary" 
          :icon="Plus" 
          class="!h-12 !px-6 !rounded-2xl !shadow-lg shadow-blue-500/30"
          @click="dialogVisible = true"
        >
          Tạo đơn hàng mới
        </el-button>
      </div>
    </div>

    <!-- Status Tabs / Filters -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
       <div class="p-1.5 bg-gray-100 rounded-[24px] flex space-x-1">
          <button 
            v-for="tab in statusTabs" 
            :key="tab.value"
            @click="activeStatus = tab.value"
            class="px-6 py-3 rounded-[20px] text-xs font-black uppercase tracking-widest transition-all duration-300"
            :class="activeStatus === tab.value ? 'bg-white text-blue-600 shadow-sm shadow-blue-200/50 scale-105' : 'text-gray-400 hover:text-gray-600'"
          >
            {{ tab.label }}
          </button>
       </div>
       
       <div class="flex items-center space-x-4">
          <el-input 
            v-model="searchQuery" 
            placeholder="Tìm mã đơn, khách hàng..." 
            class="h-12 !rounded-2xl w-72 premium-search"
            :prefix-icon="Search"
          />
          <el-button :icon="Filter" class="!h-12 !w-12 !p-0 !rounded-2xl !bg-white !border-gray-100" />
       </div>
    </div>

    <!-- Orders Table -->
    <el-card shadow="never" class="!border-none !rounded-[40px] shadow-premium overflow-hidden" v-loading="orderStore.loading">
      <el-table 
        :data="paginatedOrders" 
        stripe 
        style="width: 100%" 
        class="premium-table"
        header-row-class-name="premium-table-header"
      >
        <el-table-column label="Mã đơn" width="160">
          <template #default="{ row }">
             <div class="flex flex-col">
                <span class="text-sm font-black text-blue-600 tracking-tighter">#{{ row.orderCode }}</span>
                <span class="text-[10px] text-gray-400 font-bold uppercase">{{ formatDate(row.createdAt) }}</span>
             </div>
          </template>
        </el-table-column>

        <el-table-column label="Thông tin khách hàng" width="220">
           <template #default="{ row }">
              <div class="flex items-center space-x-3 py-2">
                 <el-avatar :size="32" class="!bg-blue-50 !text-blue-600 font-bold text-xs">{{ row.customerName?.charAt(0) }}</el-avatar>
                 <div>
                    <p class="text-sm font-bold text-gray-900 leading-none mb-1">{{ row.customerName }}</p>
                    <p class="text-[10px] text-gray-400">{{ row.customerPhone }}</p>
                 </div>
              </div>
           </template>
        </el-table-column>

        <el-table-column label="Lộ trình vận chuyển">
          <template #default="{ row }">
             <div class="flex items-center space-x-4 py-2">
                <div class="flex flex-col items-center">
                   <div class="w-2 h-2 rounded-full border-2 border-blue-600"></div>
                   <div class="w-[1px] h-4 bg-gray-200"></div>
                   <div class="w-2 h-2 rounded-full bg-blue-600"></div>
                </div>
                <div class="flex flex-col space-y-1">
                   <p class="text-[10px] font-bold text-gray-800 line-clamp-1">{{ row.pickupAddress }}</p>
                   <p class="text-[10px] text-gray-400 line-clamp-1">{{ row.deliveryAddress }}</p>
                </div>
             </div>
          </template>
        </el-table-column>

        <el-table-column label="QR Code" width="100" align="center">
          <template #default="{ row }">
            <el-popover placement="top" :width="200" trigger="hover">
              <template #reference>
                <el-button :icon="Van" size="small" circle link class="!text-emerald-600" />
              </template>
              <div class="flex flex-col items-center">
                <p class="text-[10px] font-black mb-2">QUÉT ĐỂ LẤY HÀNG</p>
                <img v-if="row.qrImageUrl" :src="'http://localhost:3000' + row.qrImageUrl" class="w-32 h-32 rounded-lg shadow-sm" />
                <span class="text-[10px] text-gray-400 mt-2 font-bold">{{ row.qrCode }}</span>
              </div>
            </el-popover>
          </template>
        </el-table-column>

        <el-table-column prop="status" label="Trạng thái" width="140">
           <template #default="{ row }">
             <el-tag 
               :type="getStatusType(row.status)" 
               size="small" 
               class="!rounded-xl !border-none !px-4 !font-bold cursor-pointer hover:opacity-80 transition-opacity"
               effect="light"
               @click="handleStatusClick(row)"
             >
               {{ getStatusLabel(row.status) }}
             </el-tag>
           </template>
        </el-table-column>

        <el-table-column label="Thao tác" width="100" align="right">
          <template #default="{ row }">
             <div class="flex justify-end space-x-1">
                <el-button @click="handleViewDetails(row)" :icon="View" size="small" circle link class="!text-blue-600 hover:!bg-blue-50" />
                <el-dropdown trigger="click">
                   <el-button :icon="MoreFilled" size="small" circle link class="!text-gray-400 hover:!bg-gray-50" />
                   <template #dropdown>
                      <el-dropdown-menu>
                         <el-dropdown-item @click="handleOpenAssign(row)" :disabled="row.status !== 'PENDING'">Gán tài xế</el-dropdown-item>
                         <el-dropdown-item 
                           @click="handleSimulate(row)" 
                           :disabled="!['ASSIGNED', 'PICKED_UP', 'IN_TRANSIT'].includes(row.status)"
                         >🎬 Mô phỏng giao hàng</el-dropdown-item>
                         <el-dropdown-item 
                           @click="handleStopSimulate(row)"
                         >⏹️ Dừng mô phỏng</el-dropdown-item>
                         <el-dropdown-item @click="handleCopyLink(row)">🔗 Sao chép link Tracking</el-dropdown-item>
                         <el-dropdown-item>Hủy đơn</el-dropdown-item>
                         <el-dropdown-item divided type="danger" @click="handleDeleteOrder(row.id)">Xóa</el-dropdown-item>
                      </el-dropdown-menu>
                   </template>
                </el-dropdown>
             </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination -->
      <div class="mt-10 px-8 py-6 bg-gray-50 flex justify-between items-center rounded-2xl">
         <span class="text-xs text-gray-400 font-bold uppercase tracking-widest">Trang {{ currentPage }} của {{ totalPages }}</span>
         <el-pagination 
           background 
           layout="prev, pager, next" 
           :total="filteredOrders.length" 
           v-model:current-page="currentPage"
           :page-size="pageSize"
           class="premium-pagination"
         />
      </div>
    </el-card>

    <!-- Dialog: Tạo đơn mới -->
    <el-dialog v-model="dialogVisible" title="Khởi tạo đơn vận chuyển" width="600px" class="rounded-[32px] overflow-hidden">
      <el-form :model="orderForm" label-position="top" class="p-4 space-y-6">
        <div class="grid grid-cols-2 gap-6">
           <el-form-item label="Họ tên khách hàng">
             <el-input v-model="orderForm.customerName" placeholder="VD: Nguyễn Văn A" class="h-12 !rounded-xl" />
           </el-form-item>
           <el-form-item label="Số điện thoại">
             <el-input v-model="orderForm.customerPhone" placeholder="090..." class="h-12 !rounded-xl" />
           </el-form-item>
        </div>
        <el-form-item label="Địa chỉ lấy hàng">
          <el-autocomplete
            v-model="orderForm.pickup"
            :fetch-suggestions="searchAddress"
            placeholder="Tìm địa điểm lấy hàng..."
            class="w-full h-12 !rounded-xl"
            :prefix-icon="Location"
            @select="(item: any) => handleAddressSelect(item, 'pickup')"
            value-key="value"
          >
             <template #default="{ item }">
                <div class="line-clamp-1 py-1" :title="item.value">
                   <el-icon class="mr-2 text-blue-500"><Location /></el-icon>
                   <span class="text-xs font-bold">{{ item.value.split(',')[0] }}</span> 
                   <span class="text-[10px] text-gray-400"> - {{ item.value.substring(item.value.indexOf(',')+1) }}</span>
                </div>
             </template>
          </el-autocomplete>
        </el-form-item>
        <el-form-item label="Địa chỉ giao hàng">
          <el-autocomplete
            v-model="orderForm.delivery"
            :fetch-suggestions="searchAddress"
            placeholder="Tìm điểm giao hàng..."
            class="w-full h-12 !rounded-xl"
            :prefix-icon="Location"
            @select="(item: any) => handleAddressSelect(item, 'delivery')"
            value-key="value"
          >
             <template #default="{ item }">
                <div class="line-clamp-1 py-1" :title="item.value">
                   <el-icon class="mr-2 text-blue-500"><Location /></el-icon>
                   <span class="text-xs font-bold">{{ item.value.split(',')[0] }}</span> 
                   <span class="text-[10px] text-gray-400"> - {{ item.value.substring(item.value.indexOf(',')+1) }}</span>
                </div>
             </template>
          </el-autocomplete>
        </el-form-item>
        <el-form-item label="Chọn tài xế điều phối (Tùy chọn)">
             <el-select v-model="orderForm.driverId" placeholder="-- Không chọn / Tìm tài xế sau --" class="w-full h-12 !rounded-xl" clearable>
              <el-option 
                v-for="driver in driverStore.drivers" 
                :key="driver.id" 
                :label="driver.fullName + (driver.isOnline ? ' (Trực tuyến)' : ' (Ngoại tuyến)')" 
                :value="driver.id" 
              />
           </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="flex items-center justify-end space-x-4 p-4 border-t border-gray-50">
           <el-button @click="dialogVisible = false" class="!border-none !text-gray-400 font-bold">Hủy bỏ</el-button>
           <el-button 
             type="primary" 
             @click="handleAddOrder" 
             :loading="submitting"
             class="!h-12 !px-8 !rounded-xl !shadow-lg shadow-blue-500/20"
           >
             {{ orderForm.driverId ? 'Khởi tạo & Gán đơn' : 'Khởi tạo PENDING' }}
           </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- Dialog: Chi tiết đơn hàng -->
    <el-dialog v-model="detailsDialogVisible" title="Chi tiết vận đơn" width="700px" class="rounded-[40px] overflow-hidden">
      <div v-if="selectedOrder" class="p-6 space-y-8">
         <div class="flex items-start justify-between">
            <div class="space-y-4 flex-1 pr-10">
               <div>
                  <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Mã vận đơn</p>
                  <p class="text-2xl font-black text-blue-600">#{{ selectedOrder.orderCode }}</p>
               </div>
               <div class="grid grid-cols-2 gap-6">
                  <div>
                    <p class="text-[10px] font-black text-gray-400 uppercase mb-1">Khách hàng</p>
                    <p class="text-sm font-bold text-gray-900">{{ selectedOrder.customerName }}</p>
                    <p class="text-xs text-gray-400">{{ selectedOrder.customerPhone }}</p>
                  </div>
                  <div>
                    <p class="text-[10px] font-black text-gray-400 uppercase mb-1">Trạng thái</p>
                    <el-tag :type="getStatusType(selectedOrder.status)" size="small" class="!rounded-lg !font-bold">
                       {{ getStatusLabel(selectedOrder.status) }}
                    </el-tag>
                  </div>
               </div>
            </div>
            <div class="flex flex-col items-center p-4 bg-gray-50 rounded-[32px] border border-gray-100">
               <p class="text-[10px] font-black text-gray-400 uppercase mb-3">Mã QR Xác nhận</p>
               <img v-if="selectedOrder.qrImageUrl" :src="'http://localhost:3000' + selectedOrder.qrImageUrl" class="w-40 h-40 rounded-2xl shadow-xl bg-white p-2" />
               <p class="text-[10px] text-blue-600 font-bold mt-3 tracking-widest">{{ selectedOrder.qrCode }}</p>
            </div>
         </div>

         <div class="space-y-4 p-6 bg-[#f8fafc] rounded-[32px]">
            <div class="flex items-start space-x-4">
               <div class="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
                  <div class="w-2 h-2 rounded-full border-2 border-blue-600"></div>
               </div>
               <div>
                  <p class="text-[10px] font-black text-gray-400 uppercase">Điểm lấy hàng</p>
                  <p class="text-xs font-bold text-gray-800">{{ selectedOrder.pickupAddress }}</p>
               </div>
            </div>
            <div class="ml-4 h-8 w-[1px] bg-gray-200"></div>
            <div class="flex items-start space-x-4">
               <div class="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-200">
                  <el-icon color="white" :size="12"><Location /></el-icon>
               </div>
               <div>
                  <p class="text-[10px] font-black text-gray-400 uppercase">Điểm giao hàng</p>
                  <p class="text-xs font-bold text-gray-800">{{ selectedOrder.deliveryAddress }}</p>
               </div>
            </div>
         </div>

         <div v-if="selectedOrder.driver" class="p-6 border border-gray-100 rounded-[32px] flex items-center justify-between">
            <div class="flex items-center space-x-4">
               <el-avatar :size="48" src="https://github.com/nutlope.png" class="ring-4 ring-gray-50" />
               <div>
                  <p class="text-[10px] font-black text-gray-400 uppercase">Tài xế phụ trách</p>
                  <p class="text-sm font-bold text-gray-900">{{ selectedOrder.driver.fullName }}</p>
               </div>
            </div>
            <el-button type="primary" link class="font-bold">Liên hệ</el-button>
         </div>
      </div>
    </el-dialog>

    <!-- Dialog: Gán tài xế -->
    <el-dialog v-model="assignDialogVisible" title="Điều phối tài xế" width="500px" class="rounded-[32px]">
      <div class="p-4 space-y-6">
         <div v-if="selectedOrder" class="p-4 bg-blue-50 rounded-2xl flex items-center space-x-4">
            <div class="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
               <span class="text-white font-black text-xs">#{{ selectedOrder.orderCode }}</span>
            </div>
            <div>
               <p class="text-xs font-bold text-blue-900">Đang gán đơn cho khách hàng</p>
               <p class="text-[10px] text-blue-600 uppercase font-black">{{ selectedOrder.customerName }}</p>
            </div>
         </div>

         <el-form label-position="top">
            <el-form-item label="Chọn tài xế khả dụng">
               <el-select v-model="assignmentForm.driverId" placeholder="Tìm tên hoặc SĐT..." class="w-full h-12 !rounded-xl" filterable>
                  <el-option 
                    v-for="driver in driverStore.drivers" 
                    :key="driver.id" 
                    :label="driver.fullName + (driver.isOnline ? ' (Online)' : ' (Offline)')" 
                    :value="driver.id" 
                  />
               </el-select>
            </el-form-item>
         </el-form>
      </div>
      <template #footer>
        <div class="flex items-center justify-end space-x-4 p-4 border-t border-gray-50">
           <el-button @click="assignDialogVisible = false" class="!border-none !text-gray-400 font-bold">Hủy bỏ</el-button>
           <el-button 
             type="primary" 
             @click="handleAssignDriver" 
             :loading="submitting"
             :disabled="!assignmentForm.driverId"
             class="!h-12 !px-8 !rounded-xl !shadow-lg shadow-blue-500/20"
           >
             Xác nhận điều phối
           </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch, onMounted } from 'vue';
import { 
  Plus, Search, View, Filter, Download, 
  Location, MoreFilled, Van
} from '@element-plus/icons-vue';
import { useOrderStore } from '../stores/orderStore';
import { useDriverStore } from '../stores/driverStore';
import { ElMessage, ElMessageBox } from 'element-plus';
import axios from 'axios';
import api from '../services/api';

const orderStore = useOrderStore();
const driverStore = useDriverStore();
const dialogVisible = ref(false);
const submitting = ref(false);
const searchQuery = ref('');
const activeStatus = ref('ALL');
const currentPage = ref(1);
const pageSize = ref(6);

// New states for details and assignment
const detailsDialogVisible = ref(false);
const assignDialogVisible = ref(false);
const selectedOrder = ref<any>(null);
const assignmentForm = reactive({
  driverId: ''
});

const orderForm = reactive({
  customerName: '',
  customerPhone: '',
  pickup: '',
  pickupLat: 0,
  pickupLng: 0,
  delivery: '',
  deliveryLat: 0,
  deliveryLng: 0,
  driverId: ''
});

onMounted(() => {
  orderStore.fetchOrders();
  driverStore.fetchDrivers();
});

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) + ', ' + 
         date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

let debounceTimer: any;
const searchAddress = (queryString: string, cb: (results: any[]) => void) => {
  if (!queryString) return cb([]);
  if (debounceTimer) clearTimeout(debounceTimer);
  
  debounceTimer = setTimeout(async () => {
    try {
      const res = await axios.get(`https://nominatim.openstreetmap.org/search`, {
        params: { q: queryString, format: 'json', addressdetails: 1, limit: 5 }
      });
      const results = res.data.map((item: any) => ({
        value: item.display_name,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon)
      }));
      cb(results);
    } catch (error) {
      cb([]);
    }
  }, 500);
};

const handleAddressSelect = (item: any, type: 'pickup' | 'delivery') => {
  if (type === 'pickup') {
    orderForm.pickup = item.value;
    orderForm.pickupLat = item.lat;
    orderForm.pickupLng = item.lng;
  } else {
    orderForm.delivery = item.value;
    orderForm.deliveryLat = item.lat;
    orderForm.deliveryLng = item.lng;
  }
};

const statusTabs = [
  { label: 'Tất cả', value: 'ALL' },
  { label: 'Chờ gán', value: 'PENDING' },
  { label: 'Đang giao', value: 'IN_TRANSIT' },
  { label: 'Hoàn thành', value: 'DELIVERED' },
];

const filteredOrders = computed(() => {
  return orderStore.orders.filter(order => {
    const matchesStatus = activeStatus.value === 'ALL' || order.status === activeStatus.value;
    const matchesSearch = (order.orderCode || '').toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                          (order.customerName || '').toLowerCase().includes(searchQuery.value.toLowerCase());
    return matchesStatus && matchesSearch;
  });
});

const paginatedOrders = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredOrders.value.slice(start, end);
});

const totalPages = computed(() => Math.ceil(filteredOrders.value.length / pageSize.value) || 1);

watch([searchQuery, activeStatus], () => {
  currentPage.value = 1;
});

const handleAddOrder = async () => {
    if (!orderForm.customerName || !orderForm.customerPhone || !orderForm.pickup || !orderForm.delivery) {
        ElMessage.warning('Vui lòng điền đầy đủ thông tin đơn hàng');
        return;
    }
    if (!orderForm.pickupLat || !orderForm.deliveryLat) {
        ElMessage.warning('Vui lòng chọn địa chỉ TỪ DANH SÁCH GỢI Ý để hệ thống lấy tọa độ bản đồ!');
        return;
    }

    submitting.value = true;
    
    try {
        await orderStore.addOrder({ 
          customerName: orderForm.customerName,
          customerPhone: orderForm.customerPhone,
          pickup: orderForm.pickup,
          pickupLat: orderForm.pickupLat,
          pickupLng: orderForm.pickupLng,
          delivery: orderForm.delivery,
          deliveryLat: orderForm.deliveryLat,
          deliveryLng: orderForm.deliveryLng,
          driverId: orderForm.driverId,
        });
        
        submitting.value = false;
        dialogVisible.value = false;
        
        Object.assign(orderForm, {
            customerName: '', customerPhone: '', pickup: '', pickupLat: 0, pickupLng: 0,
            delivery: '', deliveryLat: 0, deliveryLng: 0, driverId: ''
        });
        
        ElMessage.success('Khởi tạo đơn hàng thành công!');
    } catch (err) {
        submitting.value = false;
        ElMessage.error('Lỗi khi lưu đơn hàng vào hệ thống. Vui lòng thử lại!');
        console.error(err);
    }
};

// Detail Handlers
const handleViewDetails = (row: any) => {
  selectedOrder.value = row;
  detailsDialogVisible.value = true;
};

// Assignment Handlers
const handleOpenAssign = (row: any) => {
  selectedOrder.value = row;
  assignmentForm.driverId = '';
  assignDialogVisible.value = true;
};

const handleAssignDriver = async () => {
    if (!selectedOrder.value || !assignmentForm.driverId) return;
    
    submitting.value = true;
    try {
        await orderStore.assignDriver(selectedOrder.value.id, assignmentForm.driverId);
        ElMessage.success('Điều phối tài xế thành công!');
        assignDialogVisible.value = false;
    } catch (err) {
        ElMessage.error('Lỗi khi gán tài xế. Vui lòng kiểm tra lại!');
    } finally {
        submitting.value = false;
    }
};

const handleDeleteOrder = (id: string) => {
    ElMessageBox.confirm(
        'Bạn có chắc chắn muốn xóa đơn hàng này?',
        'Cảnh báo',
        {
          confirmButtonText: 'Xóa',
          cancelButtonText: 'Hủy',
          type: 'warning',
          confirmButtonClass: '!bg-rose-500 !border-none',
          cancelButtonClass: '!text-gray-400 !border-none'
        }
    ).then(() => {
        orderStore.deleteOrder(id);
        ElMessage.success('Đã xóa đơn hàng');
    });
};

const handleStatusClick = (row: any) => {
    const statusCycle: any[] = ['PENDING', 'ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED'];
    const currentIndex = statusCycle.indexOf(row.status);
    const nextIndex = (currentIndex + 1) % statusCycle.length;
    orderStore.updateOrderStatus(row.id, statusCycle[nextIndex]);
    ElMessage.success(`Cập nhật trạng thái mới: ${getStatusLabel(statusCycle[nextIndex])}`);
};

const getStatusType = (status: string) => {
  switch (status) {
    case 'IN_TRANSIT': return 'primary';
    case 'PICKED_UP': return 'warning';
    case 'ASSIGNED': return 'info';
    case 'DELIVERED': return 'success';
    case 'PENDING': return 'warning';
    default: return 'info';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'IN_TRANSIT': return 'Đang chuyển';
    case 'PICKED_UP': return 'Đã lấy hàng';
    case 'ASSIGNED': return 'Đã gán';
    case 'DELIVERED': return 'Đã giao';
    case 'PENDING': return 'Chờ gán';
    default: return status;
  }
};

// Simulation Handlers
const handleSimulate = async (row: any) => {
  try {
    ElMessage.info('🎬 Đang khởi tạo mô phỏng giao hàng...');
    await api.post(`/orders/${row.id}/simulate`);
    ElMessage.success(`🎬 Đã bắt đầu mô phỏng đơn ${row.orderCode}! Mở trang Live-Tracking để xem.`);
    orderStore.fetchOrders(); // Refresh to see IN_TRANSIT status
  } catch (err: any) {
    ElMessage.error(err.response?.data?.message || 'Không thể bắt đầu mô phỏng');
  }
};

const handleStopSimulate = async (row: any) => {
  try {
    await api.post(`/orders/${row.id}/stop-simulate`);
    ElMessage.success('⏹️ Đã dừng mô phỏng');
  } catch (err: any) {
    ElMessage.error(err.response?.data?.message || 'Không có mô phỏng đang chạy');
  }
};

const handleCopyLink = async (row: any) => {
  const url = `${window.location.origin}/track/${row.id}`;
  try {
    await navigator.clipboard.writeText(url);
    ElMessage.success('Đã copy link tracking cho khách hàng!');
  } catch (err) {
    ElMessage.error('Không thể copy. Hãy copy thủ công: ' + url);
  }
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
   border-bottom: 1px solid #f8fafc !important;
   padding: 24px 0 !important;
}

:deep(.premium-search .el-input__wrapper) {
   box-shadow: 0 4px 12px rgba(0,0,0,0.03) !important;
   border: none !important;
   border-radius: 20px !important;
   padding: 0 20px !important;
}
</style>
