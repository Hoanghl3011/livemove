<template>
  <div class="h-[calc(100vh-160px)] w-full rounded-[40px] overflow-hidden shadow-premium border border-white/50 relative group">
    <!-- Map Container -->
    <div id="map" class="h-full w-full grayscale-[0.2] contrast-[1.1]"></div>

    <!-- Map Controls Overlay (Top Left) -->
    <div class="absolute top-8 left-8 z-[1000] space-y-4 pointer-events-none">
       <div class="glass p-6 w-80 rounded-[32px] shadow-2xl pointer-events-auto border-none">
          <h3 class="text-lg font-black text-gray-900 flex items-center mb-4">
            <div class="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center mr-3 shadow-lg shadow-blue-500/20">
               <el-icon color="white"><Location /></el-icon>
            </div>
            Giám sát đội xe
          </h3>
          
          <el-input 
             v-model="searchQuery" 
             placeholder="Tìm tên tài xế hoặc mã đơn..." 
             class="mb-4 !rounded-xl"
          >
             <template #prefix>
                <el-icon><Search /></el-icon>
             </template>
          </el-input>
          
          <div class="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            <div 
              v-for="driver in filteredDrivers" 
              :key="driver.id" 
              class="p-4 bg-white/50 hover:bg-white rounded-2xl border border-transparent hover:border-blue-100 cursor-pointer transition-all duration-300 group/item shadow-sm hover:shadow-lg"
              @click="focusDriver(driver)"
            >
              <div class="flex items-center space-x-3">
                <div class="relative">
                   <el-avatar :size="40" :src="driver.avatar" class="ring-2 ring-white shadow-sm" />
                   <div class="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-white animate-pulse"></div>
                </div>
                <div class="flex-1">
                  <p class="text-sm font-bold text-gray-800 tracking-tight group-hover/item:text-blue-600 transition-colors">{{ driver.fullName }}</p>
                  <p class="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{{ driver.licensePlate }} • {{ getDriverStatus(driver.id) }}</p>
                  <p v-if="getDriverETA(driver.id)" class="text-[9px] text-blue-500 font-bold mt-1">{{ getDriverETA(driver.id) }}</p>
                </div>
                <el-icon class="text-gray-300 group-hover/item:text-blue-500"><ArrowRight /></el-icon>
              </div>
            </div>
          </div>

          <div class="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
             <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Trực tuyến: {{ onlineDrivers.length }}</span>
             <el-button link class="!text-blue-600 !text-xs font-bold">Xem danh sách</el-button>
          </div>
       </div>

       <!-- Stats floating card -->
       <div class="glass p-4 rounded-2xl flex items-center space-x-4 shadow-xl border-none pointer-events-auto">
          <div class="flex -space-x-2">
             <el-avatar v-for="i in 3" :key="i" :size="24" :src="'https://i.pravatar.cc/100?u=' + i" class="ring-2 ring-white" />
          </div>
          <p class="text-[10px] font-bold text-gray-600">+12 tài xế khác</p>
       </div>
    </div>

    <!-- Map Info (Bottom Right) -->
    <div class="absolute bottom-8 right-8 z-[1000] glass p-4 rounded-2xl flex items-center space-x-3 border-none shadow-xl pointer-events-auto">
       <div class="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
          <el-icon color="white"><Warning /></el-icon>
       </div>
       <div>
          <p class="text-xs font-bold text-gray-800">Cảnh báo khu vực</p>
          <p class="text-[10px] text-gray-400">Ùn tắc nhẹ tại Cầu Giấy</p>
       </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Location, ArrowRight, Warning, Search } from '@element-plus/icons-vue';
import { useDriverStore } from '../stores/driverStore';
import { useOrderStore } from '../stores/orderStore';

const driverStore = useDriverStore();
const orderStore = useOrderStore();
const map = ref<any>(null);
const markers = ref<Record<string, L.Marker>>({});
const activeRoutes = ref<Record<string, L.Polyline>>({});
const driverProgress = ref<Record<string, number>>({});
const searchQuery = ref('');

const onlineDrivers = computed(() => driverStore.drivers.filter(d => d.isOnline));

const filteredDrivers = computed(() => {
  if (!searchQuery.value) return onlineDrivers.value;
  const lowerQuery = searchQuery.value.toLowerCase();
  return onlineDrivers.value.filter(d => {
      const isNameMatch = d.fullName.toLowerCase().includes(lowerQuery);
      const activeOrder = orderStore.orders.find(o => o.driverId === d.id && o.status === 'IN_TRANSIT');
      const isOrderMatch = activeOrder && activeOrder.orderCode && activeOrder.orderCode.toLowerCase().includes(lowerQuery);
      return isNameMatch || isOrderMatch;
  });
});

const getDriverStatus = (driverId: string) => {
  const activeOrder = orderStore.orders.find(o => o.driverId === driverId && o.status === 'IN_TRANSIT');
  return activeOrder ? 'Đang di chuyển' : 'Đang rảnh';
};

const getDriverETA = (driverId: string) => {
  const activeOrder = orderStore.orders.find(o => o.driverId === driverId && o.status === 'IN_TRANSIT');
  if (activeOrder && activeOrder.routePath) {
     const pIdx = driverProgress.value[driverId] || 0;
     const ratio = 1 - (pIdx / activeOrder.routePath.length);
     if (ratio <= 0) return 'Đã đến nơi';
     
     const remainDist = (activeOrder.distance || 0) * ratio;
     const remainDur = (activeOrder.duration || 0) * ratio;
     return `Còn ${remainDist.toFixed(1)} km (~${Math.ceil(remainDur)} phút)`;
  }
  return '';
};

let mapInterval: any = null;

onMounted(() => {
  // Init Leaflet Map (Hanoi Default)
  map.value = L.map('map').setView([21.0285, 105.8542], 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map.value);

  updateMarkers();

  // Simulate realistic movement
  mapInterval = setInterval(() => {
    driverStore.drivers.forEach(d => {
      if (!d.isOnline) return;

      const activeOrder = orderStore.orders.find(o => o.driverId === d.id && o.status === 'IN_TRANSIT');
      
      if (activeOrder && activeOrder.routePath && activeOrder.routePath.length > 0) {
          // Bám đường (Route following)
          let pIdx = driverProgress.value[d.id] || 0;
          if (pIdx < activeOrder.routePath.length - 1) {
              pIdx += 2; // Jump 2 points every interval for visual speed
              if (pIdx >= activeOrder.routePath.length) pIdx = activeOrder.routePath.length - 1;
              
              driverProgress.value[d.id] = pIdx;
              const nextPoint = activeOrder.routePath[pIdx];
              d.lat = nextPoint[0];
              d.lng = nextPoint[1];
          }
      } else {
          // Đi dạo quanh (Wandering)
          if (d.lat === undefined) d.lat = d.lastLat || 21.0285;
          if (d.lng === undefined) d.lng = d.lastLng || 105.8542;
          
          d.lat += (Math.random() - 0.5) * 0.001;
          d.lng += (Math.random() - 0.5) * 0.001;
      }
    });
    updateMarkers();
  }, 2000); // 2 second interval for smoother animation
});

onUnmounted(() => {
  if (mapInterval) clearInterval(mapInterval);
  Object.values(markers.value).forEach(m => m.remove());
  Object.values(activeRoutes.value).forEach(r => r.remove());
  if (map.value) {
    map.value.remove();
    map.value = null;
  }
});


const updateMarkers = () => {
  if (!map.value) return;

  const currentOnlineIds = onlineDrivers.value.map(d => d.id);
  
  // Remove unused markers & routes
  Object.keys(markers.value).forEach(id => {
    if (!currentOnlineIds.includes(id)) {
      markers.value[id].remove();
      delete markers.value[id];
      if (activeRoutes.value[id]) {
          activeRoutes.value[id].remove();
          delete activeRoutes.value[id];
      }
    }
  });

  onlineDrivers.value.forEach(driver => {
    const activeOrder = orderStore.orders.find(o => o.driverId === driver.id && o.status === 'IN_TRANSIT');
    
    // Manage Polyline
    // CHỈ VẼ ROUTE NẾU: Không tìm kiếm gì (vẽ hết) HOẶC driver này khớp với tìm kiếm 
    const isTargeted = !searchQuery.value || filteredDrivers.value.some(fd => fd.id === driver.id);
    
    if (isTargeted && activeOrder && activeOrder.routePath && activeOrder.routePath.length > 0) {
        if (!activeRoutes.value[driver.id]) {
            activeRoutes.value[driver.id] = (L.polyline(activeOrder.routePath, { 
                color: '#2563eb', 
                weight: 5,
                opacity: 0.8,
                dashArray: '10, 10',
                lineJoin: 'round'
            }) as any).addTo(map.value as L.Map);
            
            if (driverProgress.value[driver.id] === undefined) {
               driverProgress.value[driver.id] = 0;
               driver.lat = activeOrder.routePath[0][0];
               driver.lng = activeOrder.routePath[0][1];
            }
        }
    } else {
        if (activeRoutes.value[driver.id]) {
            activeRoutes.value[driver.id].remove();
            delete activeRoutes.value[driver.id];
        }
    }

    // Update or Create Marker (Hanoi Default)
    const lat = driver.lat || driver.lastLat || 21.0285;
    const lng = driver.lng || driver.lastLng || 105.8542;

    if (markers.value[driver.id]) {
      markers.value[driver.id].setLatLng([lat, lng]);
      
      // Update popup string if ETA changed
      const popupStr = `<div class="p-2 min-w-[120px]">
                       <p class="font-bold text-gray-900">${driver.fullName}</p>
                       <p class="text-xs text-blue-600">${driver.licensePlate}</p>
                       <p class="text-[10px] mt-1 p-1 bg-blue-50 text-blue-600 rounded inline-block font-bold">${getDriverStatus(driver.id)}</p>
                       ${getDriverETA(driver.id) ? `<p class="text-[10px] font-black text-rose-500 mt-1">${getDriverETA(driver.id)}</p>` : ''}
                    </div>`;
      markers.value[driver.id].setPopupContent(popupStr);

    } else {
      const customIcon = L.divIcon({
        className: 'custom-drv-icon',
        html: `<div class="motorcycle-wrapper relative z-50">
                 <div class="motorcycle-icon-premium shadow-2xl flex items-center justify-center">
                    <img src="/assets/scooter.png" class="w-[44px] h-[44px] object-contain animate-bounce-subtle" />
                 </div>
                 <div class="pulse-ring-premium"></div>
               </div>`,
        iconSize: [64, 64],
        iconAnchor: [32, 32]
      });

      const marker = (L.marker([lat, lng], { icon: customIcon }) as any)
        .addTo(map.value as L.Map)
        .bindPopup(`<div class="p-2 min-w-[120px]">
                       <p class="font-bold text-gray-900">${driver.fullName}</p>
                       <p class="text-xs text-blue-600">${driver.licensePlate}</p>
                       <p class="text-[10px] mt-1 p-1 bg-blue-50 text-blue-600 rounded inline-block font-bold">${getDriverStatus(driver.id)}</p>
                       ${getDriverETA(driver.id) ? `<p class="text-[10px] font-black text-rose-500 mt-1">${getDriverETA(driver.id)}</p>` : ''}
                    </div>`);
      
      markers.value[driver.id] = marker;
    }
  });
};

const focusDriver = (driver: any) => {
  if (map.value && markers.value[driver.id]) {
    (map.value as L.Map).flyTo([driver.lat, driver.lng], 16, { duration: 1.5 });
    markers.value[driver.id].openPopup();
  }
};
</script>

<style>
.custom-div-icon {
  background: transparent;
  border: none;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(0,0,0,0.05);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #cbd5e1;
}

:deep(.leaflet-marker-icon) {
  transition: all 1s linear; /* Smooth sliding for 1s updates */
}

.motorcycle-icon-premium {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #ef4444, #b91c1c);
  border-radius: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid white;
  box-shadow: 0 12px 30px -8px rgba(239, 68, 68, 0.7);
}

.animate-bounce-subtle {
  animation: bounce-subtle 1.5s infinite;
}

@keyframes bounce-subtle {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}

.pulse-ring-premium {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 58px;
  height: 58px;
  border: 3px solid #ef4444;
  border-radius: 22px;
  animation: pulse-premium 2s infinite;
}

@keyframes pulse-premium {
  0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.8; }
  100% { transform: translate(-50%, -50%) scale(1.6); opacity: 0; }
}

.leaflet-popup-content-wrapper {
  border-radius: 16px !important;
  box-shadow: 0 10px 30px -10px rgba(0,0,0,0.1) !important;
}

/* Hiệu ứng animation đường kẻ */
.leaflet-interactive {
  stroke-dasharray: 10;
  animation: dash 2s linear infinite;
}

@keyframes dash {
  to {
    stroke-dashoffset: -20;
  }
}
</style>
