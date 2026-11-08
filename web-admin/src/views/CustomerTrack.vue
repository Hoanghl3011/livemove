<template>
  <div class="h-screen w-full bg-slate-50 flex flex-col font-sans animate-fade-in relative overflow-hidden" v-if="order">
    <!-- Header -->
    <div class="absolute top-0 w-full z-[1000] p-4 pointer-events-none">
       <div class="glass max-w-lg mx-auto p-4 rounded-[28px] shadow-xl pointer-events-auto flex items-center justify-between">
          <div class="flex items-center space-x-3">
             <div class="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
               <el-icon color="white" :size="20"><Box /></el-icon>
             </div>
             <div>
                <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Đơn hàng của bạn</p>
                <p class="text-sm font-black text-gray-900 tracking-tight">#{{ order.orderCode }}</p>
             </div>
          </div>
          <el-tag :type="getStatusType(order.status)" size="large" effect="light" class="!rounded-xl !font-bold !border-none">
            {{ getStatusLabel(order.status) }}
          </el-tag>
       </div>
    </div>

    <!-- Main Map -->
    <div class="flex-1 w-full relative">
      <div id="customer-map" class="w-full h-full grayscale-[0.1] contrast-[1.05]"></div>
    </div>

    <!-- Bottom Tracking Panel (Progress & ETA) - NOW DRAGGABLE & COLLAPSIBLE -->
    <div 
      class="fixed z-[1000] select-none transition-transform duration-300"
      :style="{ 
        bottom: `${pos.y}px`, 
        right: `${pos.x}px`,
        cursor: isDragging ? 'grabbing' : 'default',
        transform: isDragging ? 'scale(1.02)' : 'scale(1)'
      }"
      @mousedown="startDrag"
      @touchstart="startDrag"
    >
       <!-- Minimized Pill Mode -->
       <div v-if="!isExpanded" class="glass-premium p-2 pr-4 rounded-full shadow-2xl flex items-center space-x-3 pointer-events-auto border border-blue-500/30">
          <div class="motorcycle-icon-small shadow-lg">
             <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="white" stroke-width="2">
               <circle cx="18.5" cy="17.5" r="3.5"></circle>
               <circle cx="5.5" cy="17.5" r="3.5"></circle>
               <path d="M7 17.5l2-4.5 4 1h4l1.5-5"></path>
               <path d="M11 6h3.5L17 9.5l-4 1-5-1L6 6h5z"></path>
             </svg>
          </div>
          <div class="flex flex-col">
             <p class="text-[9px] font-black text-blue-600 uppercase tracking-tighter">ETA</p>
             <p class="text-sm font-black text-gray-900 leading-none">
               {{ trackingData?.etaMinutes ? `${trackingData.etaMinutes}m` : '---' }}
             </p>
          </div>
          <el-button circle :icon="FullScreen" color="#2563eb" plain size="small" @click.stop="toggleExpand" />
       </div>

       <!-- Full Expanded Card -->
       <div v-else class="glass-premium p-6 rounded-[32px] shadow-2xl border border-white/50 space-y-5 w-[380px] pointer-events-auto relative overflow-hidden">
          <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-rose-500 opacity-80"></div>
          
          <div class="flex items-center justify-between">
             <div class="flex items-center space-x-3">
                <div class="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-700 flex items-center justify-center shadow-lg">
                  <el-icon color="white" :size="20"><UserFilled /></el-icon>
                </div>
                <div>
                   <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tài xế của bạn</p>
                   <h3 class="text-base font-black text-gray-900 leading-tight">
                      {{ trackingData?.driverName || order.driver?.fullName || 'Đang chờ...' }}
                   </h3>
                </div>
             </div>
             <el-button circle :icon="Minus" size="small" @click.stop="toggleExpand" class="!bg-gray-100 !border-none" />
          </div>

          <div class="flex justify-between items-end">
             <div class="space-y-1">
                <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Trạng thái</p>
                <el-tag :type="getStatusType(order.status)" size="small" effect="dark" class="!rounded-lg !font-bold">
                   {{ getStatusLabel(order.status) }}
                </el-tag>
             </div>
             <div class="text-right">
                <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Dự kiến đến</p>
                <p class="text-3xl font-black text-blue-600 drop-shadow-sm">
                  {{ trackingData?.etaMinutes ? `${trackingData.etaMinutes} phút` : '---' }}
                </p>
             </div>
          </div>

          <!-- Progress -->
          <div class="space-y-2">
             <el-progress 
               :percentage="trackingProgress" 
               :show-text="false" 
               :stroke-width="10"
               status="success"
               class="!rounded-full shadow-inner"
               color="linear-gradient(to right, #3b82f6, #6366f1)"
             />
             <div class="flex justify-between text-[9px] font-black text-gray-400 uppercase tracking-widest">
                <span>{{ trackingData?.speed ? (trackingData.speed * 3.6).toFixed(0) + ' km/h' : '0 km/h' }}</span>
                <span>Còn {{ trackingData?.distanceRemaining ? trackingData.distanceRemaining + ' km' : '...' }}</span>
             </div>
          </div>

          <!-- Route Detail (Address Timeline) -->
          <div class="space-y-3">
             <div class="flex items-start space-x-3 bg-slate-50 p-4 rounded-2xl border border-slate-100/50">
                <div class="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0 shadow-sm border border-green-200">
                  <el-icon class="text-green-600"><Location /></el-icon>
                </div>
                <div class="flex-1 overflow-hidden">
                  <p class="text-[9px] font-black text-gray-400 opacity-60 uppercase tracking-widest">Điểm lấy hàng</p>
                  <p class="text-[11px] font-bold text-gray-700 truncate" :title="order.pickupAddress">{{ order.pickupAddress || 'Đang cập nhật...' }}</p>
                </div>
             </div>

             <div class="flex items-start space-x-3 bg-slate-50 p-4 rounded-2xl border border-slate-100/50">
                <div class="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center shrink-0 shadow-sm border border-rose-200">
                  <el-icon class="text-rose-600"><Location /></el-icon>
                </div>
                <div class="flex-1 overflow-hidden">
                  <p class="text-[9px] font-black text-gray-400 opacity-60 uppercase tracking-widest">Giao đến</p>
                  <p class="text-[11px] font-bold text-gray-700 truncate" :title="order.deliveryAddress">{{ order.deliveryAddress }}</p>
                </div>
             </div>
          </div>
       </div>
    </div>
  </div>
  
  <div v-else-if="error" class="h-screen w-full flex items-center justify-center bg-slate-50">
     <el-empty description="Không tìm thấy đơn hàng hoặc link đã hỏng" />
  </div>
  
  <div v-else class="h-screen w-full flex flex-col items-center justify-center bg-slate-50 space-y-4">
     <el-spinner class="text-blue-600 text-4xl animate-spin" />
     <p class="font-bold text-gray-500 text-sm animate-pulse">Đang tải hành trình...</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { io, Socket } from 'socket.io-client';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Box, Location, UserFilled, Minus, FullScreen } from '@element-plus/icons-vue';

const route = useRoute();
const orderId = route.params.id as string;

// UI Logic
const isExpanded = ref(true);
const isDragging = ref(false);
const pos = ref({ x: 24, y: 24 }); // Right / Bottom
const dragOffset = ref({ x: 0, y: 0 });

const toggleExpand = () => { isExpanded.value = !isExpanded.value; };

const startDrag = (e: MouseEvent | TouchEvent) => {
    isDragging.value = true;
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
    
    dragOffset.value = { 
        x: window.innerWidth - clientX - pos.value.x,
        y: window.innerHeight - clientY - pos.value.y
    };
    
    document.addEventListener('mousemove', onDrag);
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchmove', onDrag);
    document.addEventListener('touchend', endDrag);
};

const onDrag = (e: any) => {
    if (!isDragging.value) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    pos.value.x = window.innerWidth - clientX - dragOffset.value.x;
    pos.value.y = window.innerHeight - clientY - dragOffset.value.y;
    
    // Limits
    if (pos.value.x < 0) pos.value.x = 0;
    if (pos.value.y < 0) pos.value.y = 0;
};

const endDrag = () => {
    isDragging.value = false;
    document.removeEventListener('mousemove', onDrag);
    document.removeEventListener('mouseup', endDrag);
    document.removeEventListener('touchmove', onDrag);
    document.removeEventListener('touchend', endDrag);
};

// State
const order = ref<any>(null);
const error = ref(false);
const trackingData = ref<any>(null);

// Leaflet Instances
const map = ref<L.Map | null>(null);
const driverMarker = ref<L.Marker | null>(null);
const activePolyline = ref<L.Polyline | null>(null);
const remainingPolyline = ref<L.Polyline | null>(null);
let socket: Socket | null = null;
let fullRouteCoords: [number, number][] = [];

// Computed
const trackingProgress = computed(() => {
  if (order.value?.status === 'DELIVERED') return 100;
  if (!trackingData.value?.progressPercent) return order.value?.status === 'PICKED_UP' || order.value?.status === 'IN_TRANSIT' ? 10 : 0;
  return trackingData.value.progressPercent;
});

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'IN_TRANSIT': return 'Đang giao đến bạn';
    case 'PICKED_UP': return 'Đã lấy hàng';
    case 'DELIVERED': return 'Giao thành công';
    case 'ASSIGNED': return 'Tài xế đang đến lấy';
    default: return 'Chờ xử lý';
  }
};

const getStatusType = (status: string) => {
  switch (status) {
    case 'DELIVERED': return 'success';
    case 'IN_TRANSIT': return 'primary';
    case 'PICKED_UP': return 'warning';
    default: return 'info';
  }
};

onMounted(async () => {
    if (!orderId) {
       error.value = true;
       return;
    }
    await fetchOrderData();
    if (order.value) {
       initMap();
       setupSocket();
    }
});

onUnmounted(() => {
    if (socket) socket.disconnect();
    if (map.value) map.value.remove();
});

const fetchOrderData = async () => {
   try {
     const res = await axios.get(`http://localhost:3000/orders/${orderId}/track`);
     order.value = res.data;
     
     // Fetch full route to split it into two colors
     const routeRes = await fetch(`https://router.project-osrm.org/route/v1/driving/${order.value.pickupLng},${order.value.pickupLat};${order.value.deliveryLng},${order.value.deliveryLat}?overview=full&geometries=geojson`);
     const routeData = await routeRes.json();
     if (routeData.routes && routeData.routes.length > 0) {
        fullRouteCoords = routeData.routes[0].geometry.coordinates.map((coord: number[]) => [coord[1], coord[0]]);
     }
   } catch (err) {
     error.value = true;
     console.error(err);
   }
};

const initMap = () => {
  map.value = L.map('customer-map', { zoomControl: false }).setView([order.value.pickupLat, order.value.pickupLng], 14);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map.value);

  // Pickup Marker
  const pickupIcon = L.divIcon({
    className: 'custom-pickup-icon',
    html: `<div class="w-10 h-10 bg-white rounded-full p-1 shadow-xl border-4 border-green-500 flex items-center justify-center"><div class="w-3 h-3 bg-green-500 rounded-full"></div></div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20]
  });
  (L.marker([order.value.pickupLat, order.value.pickupLng], { icon: pickupIcon }) as any).addTo(map.value as any).bindPopup("Điểm nhận hàng");

  // Delivery Marker
  const destIcon = L.divIcon({
    className: 'custom-dest-icon',
    html: `<div class="w-10 h-10 bg-white rounded-full p-1 shadow-xl border-4 border-rose-500 flex items-center justify-center"><div class="w-3 h-3 bg-rose-500 rounded-full"></div></div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20]
  });
  (L.marker([order.value.deliveryLat, order.value.deliveryLng], { icon: destIcon }) as any).addTo(map.value as any).bindPopup("Điểm giao hàng");
  
  // Route 2 Màu
  if (fullRouteCoords.length > 0) {
      // Ban đầu toàn bộ là xanh
      remainingPolyline.value = (L.polyline(fullRouteCoords, { 
          color: '#2563eb', weight: 5, opacity: 0.8, dashArray: '10, 10'
      }) as any).addTo(map.value as L.Map);
      
      (map.value as L.Map).fitBounds(remainingPolyline.value!.getBounds(), { padding: [50, 50] });
  }
};

const setupSocket = () => {
  socket = io('http://localhost:3000', {
    transports: ['websocket'],
    // Note: Ở mode Public Track, ko cần JWT, Backend Gateway cần handle việc room join cho khách. (Ở đây ta tạm thời dùng cho demo)
  });

  socket.on('connect', () => {
     socket?.emit('tracking:subscribe', { orderId });
  });

  socket.on('tracking:update', (data: any) => {
     if (data.orderId !== orderId) return;
     trackingData.value = data;

     if (map.value) {
        const latLng: [number, number] = [data.lat, data.lng];
        
        if (!driverMarker.value) {
            const driverIcon = L.divIcon({
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
            driverMarker.value = (L.marker(latLng, { icon: driverIcon }) as any).addTo(map.value as L.Map);
        } else {
            // Cập nhật vị trí điểm đến của transition thông qua việc setLatLng
            driverMarker.value.setLatLng(latLng);
        }
        
        map.value.panTo(latLng, { animate: true, duration: 1.5 });

        // Update 2-color route
        updateTwoColorRoute(latLng);
     }
  });
};

const updateTwoColorRoute = (currentLoc: [number, number]) => {
   if (fullRouteCoords.length === 0 || !remainingPolyline.value || !map.value) return;
   
   // Tìm điểm gần nhất trên route
   let closestIdx = 0;
   let minDst = Infinity;
   for (let i = 0; i < fullRouteCoords.length; i++) {
      const dst = Math.pow(fullRouteCoords[i][0] - currentLoc[0], 2) + Math.pow(fullRouteCoords[i][1] - currentLoc[1], 2);
      if (dst < minDst) {
         minDst = dst;
         closestIdx = i;
      }
   }

   const passed = fullRouteCoords.slice(0, closestIdx + 1);
   const remaining = fullRouteCoords.slice(closestIdx);
   
   if (!activePolyline.value) {
       activePolyline.value = (L.polyline(passed, { color: '#9ca3af', weight: 5, opacity: 0.8 }) as any).addTo(map.value as any);
   } else {
       activePolyline.value.setLatLngs(passed);
   }
   
   remainingPolyline.value.setLatLngs(remaining);
};
</script>

<style scoped>
.glass-premium {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
}

:deep(.leaflet-marker-icon) {
  transition: all 1s linear; /* Mượt mà trượt theo 1 giây cập nhật */
}

.motorcycle-icon-premium {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #ef4444, #b91c1c); /* Red gradient */
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

.motorcycle-icon-small {
  width: 32px;
  height: 32px;
  background: #ef4444;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
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
</style>
