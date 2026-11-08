<template>
  <div class="space-y-10">
    <!-- KPI Header Section -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      <div 
        v-for="(card, index) in kpiCards" 
        :key="index"
        class="group relative p-8 bg-white rounded-[32px] shadow-premium overflow-hidden transition-all duration-500 hover:-translate-y-2"
      >
        <div class="relative z-10 flex flex-col">
          <span class="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-2">{{ card.title }}</span>
          <h4 class="text-4xl font-black text-gray-900 group-hover:text-blue-600 transition-colors">{{ card.value }}</h4>
          <div class="mt-4 flex items-center text-xs font-bold" :class="card.up ? 'text-emerald-500' : 'text-rose-500'">
            <el-icon class="mr-1"><component :is="card.up ? 'TopRight' : 'BottomRight'" /></el-icon>
            {{ card.trend }} từ hôm qua
          </div>
        </div>
        <!-- Abstract Background Icon -->
        <div class="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
           <el-icon :size="120"><component :is="card.icon" /></el-icon>
        </div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-10">
      <!-- Main Chart -->
      <div class="lg:col-span-2 p-10 bg-white rounded-[40px] shadow-premium border border-gray-50">
        <div class="flex items-center justify-between mb-10">
          <div>
             <h3 class="text-2xl font-black text-gray-900">Phân tích vận hành</h3>
             <p class="text-gray-400 text-sm">Hiệu suất đơn hàng theo thời gian thực</p>
          </div>
          <div class="p-1 bg-gray-100 rounded-2xl flex">
            <el-button 
              v-for="t in ['Ngày', 'Tuần', 'Tháng']" 
              :key="t" 
              size="small" 
              class="!rounded-xl !border-none !px-4"
              :type="t === 'Tuần' ? 'primary' : 'default'"
            >{{ t }}</el-button>
          </div>
        </div>
        
        <div class="h-[400px]">
          <apexchart 
            type="area" 
            height="100%" 
            :options="lineChartOptions" 
            :series="lineChartSeries" 
          />
        </div>
      </div>

      <!-- Donut Chart & Activity -->
      <div class="space-y-10">
        <div class="p-10 bg-[#0f172a] rounded-[40px] shadow-2xl relative overflow-hidden h-full">
           <h3 class="text-xl font-bold text-white mb-2">Trạng thái đội xe</h3>
           <p class="text-blue-300/60 text-xs mb-8">Cập nhật trực tiếp mỗi 30s</p>
           
           <div class="h-64 flex items-center justify-center">
             <apexchart 
               type="donut" 
               width="100%"
               :options="donutChartOptions" 
               :series="donutChartSeries" 
             />
           </div>
           
           <div class="grid grid-cols-2 gap-4 mt-8">
              <div class="p-4 bg-white/5 rounded-2xl border border-white/10">
                 <p class="text-white font-bold">12</p>
                 <p class="text-[10px] text-gray-500 uppercase">Tài xế online</p>
              </div>
              <div class="p-4 bg-white/5 rounded-2xl border border-white/10">
                 <p class="text-white font-bold">8</p>
                 <p class="text-[10px] text-gray-500 uppercase">Đang giao</p>
              </div>
           </div>
        </div>
      </div>
    </div>

    <!-- Bottom Tables / Recent activity -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-10">
       <div class="p-8 bg-white rounded-[40px] shadow-premium">
          <div class="flex items-center justify-between mb-6">
             <h3 class="text-xl font-bold text-gray-900 leading-none">Đơn hàng mới nhất</h3>
             <el-button link class="!text-blue-600 font-bold">Xem tất cả</el-button>
          </div>
          <div class="space-y-4">
             <div v-for="order in recentOrders" :key="order.id" class="flex items-center p-4 hover:bg-gray-50 rounded-3xl transition-colors group">
                <div class="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                   <span class="text-blue-600 font-black text-xs">#{{ order.id }}</span>
                </div>
                <div class="flex-1">
                   <p class="text-sm font-bold text-gray-900">{{ order.customer }}</p>
                   <p class="text-[10px] text-gray-400">{{ order.time }} • {{ order.pickup }}</p>
                </div>
                <el-tag :type="order.type" size="small" class="!rounded-lg !border-none">{{ order.status }}</el-tag>
             </div>
          </div>
       </div>

       <!-- Driver Scoreboard -->
       <div class="p-8 bg-white rounded-[40px] shadow-premium">
          <div class="flex items-center justify-between mb-6">
             <h3 class="text-xl font-bold text-gray-900 leading-none">Hiệu suất tài xế</h3>
             <el-button link class="!text-blue-600 font-bold">Báo cáo chi tiết</el-button>
          </div>
          <div class="space-y-4">
             <div v-for="(driver, index) in topDrivers" :key="index" class="flex items-center p-4">
                <el-avatar :size="40" :src="driver.avatar" class="mr-4 ring-2 ring-gray-100" />
                <div class="flex-1">
                   <p class="text-sm font-bold text-gray-900">{{ driver.name }}</p>
                   <div class="w-full bg-gray-100 h-1.5 rounded-full mt-1 overflow-hidden">
                      <div class="bg-blue-600 h-full rounded-full" :style="{ width: driver.score + '%' }"></div>
                   </div>
                </div>
                <div class="ml-6 text-right">
                   <p class="text-sm font-black text-gray-900">{{ driver.orders }}</p>
                   <p class="text-[10px] text-gray-400">Đơn</p>
                </div>
             </div>
          </div>
       </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useOrderStore } from '../stores/orderStore';
import { useDriverStore } from '../stores/driverStore';

const orderStore = useOrderStore();
const driverStore = useDriverStore();

const kpiCards = computed(() => [
    { title: 'Tổng đơn hàng', value: orderStore.orders.length.toLocaleString(), trend: '12%', up: true, icon: 'Box' },
    { title: 'Tài xế Online', value: driverStore.drivers.filter(d => d.isOnline).length.toString(), trend: '5%', up: true, icon: 'User' },
    { title: 'Doanh thu ngày', value: '12.5M', trend: '8%', up: true, icon: 'DataBoard' },
    { title: 'Đã hoàn thành', value: orderStore.orders.filter(o => o.status === 'DELIVERED').length.toString(), trend: '2%', up: false, icon: 'Checked' },
]);

const recentOrders = computed(() => {
  return orderStore.orders.slice(0, 4).map(o => ({
    id: o.id.slice(0, 3),
    customer: o.customerName,
    time: o.date.split(', ')[1],
    pickup: o.pickup,
    status: o.status === 'PENDING' ? 'Chờ gán' : o.status === 'IN_TRANSIT' ? 'Đang giao' : 'Đã giao',
    type: o.status === 'PENDING' ? 'warning' : o.status === 'IN_TRANSIT' ? 'primary' : 'success'
  }));
});

const topDrivers = ref([
    { name: 'Trần Văn Tài', avatar: 'https://github.com/nutlope.png', score: 95, orders: 42 },
    { name: 'Lê Minh Hoàng', avatar: 'https://github.com/shadcn.png', score: 82, orders: 38 },
    { name: 'Nguyễn Tiến Dũng', avatar: 'https://github.com/mizhuo.png', score: 65, orders: 24 },
]);

// Charts Logic
const lineChartOptions = {
    chart: { toolbar: { show: false }, zoom: { enabled: false }, fontFamily: 'Plus Jakarta Sans', sparkline: { enabled: false } },
    colors: ['#3b82f6', '#818cf8'],
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 4 },
    fill: {
        type: 'gradient',
        gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0, stops: [0, 90, 100] }
    },
    grid: { show: true, borderColor: '#f1f5f9', strokeDashArray: 4 },
    xaxis: {
        categories: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
        axisBorder: { show: false },
        axisTicks: { show: false },
    },
    yaxis: { labels: { style: { colors: '#94a3b8' } } },
    legend: { show: false }
};

const lineChartSeries = [
    { name: 'Tuần này', data: [31, 40, 28, 51, 42, 109, 100] },
    { name: 'Tuần trước', data: [11, 32, 45, 32, 34, 52, 41] },
];

const donutChartOptions = {
    chart: { type: 'donut', fontFamily: 'Plus Jakarta Sans' },
    colors: ['#3b82f6', '#fbbf24', '#f87171', '#10b981'],
    labels: ['Trống', 'Bận', 'Ngoại tuyến', 'Sắp tới'],
    dataLabels: { enabled: false },
    stroke: { show: false },
    plotOptions: {
        pie: {
            donut: {
                size: '80%',
                labels: {
                    show: true,
                    total: {
                        show: true,
                        label: 'Tổng lực lượng',
                        color: '#94a3b8',
                        formatter: () => '64'
                    }
                }
            }
        }
    },
    legend: { position: 'bottom', labels: { colors: '#94a3b8' }, itemMargin: { vertical: 10 } }
};

const donutChartSeries = [44, 12, 15, 8];
</script>

<style scoped>
:deep(.apexcharts-tooltip) {
    background: #fff !important;
    border: none !important;
    box-shadow: 0 10px 30px -5px rgba(0,0,0,0.1) !important;
    border-radius: 12px !important;
}
</style>
