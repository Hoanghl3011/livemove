import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '../services/api';

export interface Order {
  id: string;
  orderCode: string; // Match backend
  customerName: string;
  customerPhone: string;
  pickupAddress: string; // Match backend
  pickupLat?: number;
  pickupLng?: number;
  deliveryAddress: string; // Match backend
  deliveryLat?: number;
  deliveryLng?: number;
  status: 'PENDING' | 'ASSIGNED' | 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED';
  qrCode: string;
  qrImageUrl?: string;
  createdAt: string;
  driverId?: string;
  driver?: { fullName: string };
  distance?: number;
  duration?: number;
  routePath?: [number, number][]; // Added for map route drawing
}

export const useOrderStore = defineStore('order', () => {
  const orders = ref<Order[]>([]);
  const loading = ref(false);

  const fetchOrders = async () => {
    loading.value = true;
    try {
      const res = await api.get('/orders');
      orders.value = res.data;
    } catch (err) {
      console.error('Fetch orders error:', err);
    } finally {
      loading.value = false;
    }
  };

  const addOrder = async (orderData: any) => {
    try {
      const payload: any = {
        pickupAddress: orderData.pickup,
        pickupLat: orderData.pickupLat,
        pickupLng: orderData.pickupLng,
        deliveryAddress: orderData.delivery,
        deliveryLat: orderData.deliveryLat,
        deliveryLng: orderData.deliveryLng,
        receiverName: orderData.customerName,
        receiverPhone: orderData.customerPhone,
      };

      if (orderData.driverId && String(orderData.driverId).trim() !== '') {
        payload.driverId = orderData.driverId;
      }

      const res = await api.post('/orders', payload);
      
      let finalOrder = res.data;
      if (orderData.driverId && String(orderData.driverId).trim() !== '') {
        // If driver was selected, patch to assign to trigger FCM and ASSIGNED status
        const assignRes = await api.patch(`/orders/${res.data.id}/assign`, {
          driverId: orderData.driverId
        });
        finalOrder = assignRes.data;
      }
      
      orders.value.unshift(finalOrder);
      return finalOrder;
    } catch (err) {
      console.error('Add order error:', err);
      throw err;
    }
  };

  const deleteOrder = async (id: string) => {
    orders.value = orders.value.filter(o => o.id !== id);
  };

  const updateOrderStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/orders/${id}/status`, { status });
      const order = orders.value.find(o => o.id === id);
      if (order) order.status = status as any;
    } catch (err) {
      console.error('Update status error:', err);
    }
  };

  const assignDriver = async (orderId: string, driverId: string) => {
    try {
      const res = await api.patch(`/orders/${orderId}/assign`, { driverId });
      const index = orders.value.findIndex(o => o.id === orderId);
      if (index !== -1) {
        orders.value[index] = res.data;
      }
      return res.data;
    } catch (err) {
      console.error('Assign driver error:', err);
      throw err;
    }
  };

  return { orders, loading, fetchOrders, addOrder, deleteOrder, updateOrderStatus, assignDriver };
});
