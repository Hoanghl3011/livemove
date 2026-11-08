import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '../services/api';

export interface Driver {
  id: string;
  fullName: string;
  phone: string;
  licensePlate: string;
  vehicleType: string;
  isOnline: boolean;
  ordersCount?: number;
  avatar?: string;
  lastLat?: number;
  lastLng?: number;
  lat?: number;
  lng?: number;
}

export const useDriverStore = defineStore('driver', () => {
  const drivers = ref<Driver[]>([]);
  const loading = ref(false);

  const fetchDrivers = async () => {
    loading.value = true;
    try {
      const res = await api.get('/drivers');
      drivers.value = res.data;
    } catch (err) {
      console.error('Fetch drivers error:', err);
    } finally {
      loading.value = false;
    }
  };

  const addDriver = async (driverData: any) => {
    try {
      const res = await api.post('/drivers', driverData);
      drivers.value.unshift(res.data);
      return res.data;
    } catch (err) {
      console.error('Add driver error:', err);
      throw err;
    }
  };

  const deleteDriver = async (id: string) => {
    try {
      await api.delete(`/drivers/${id}`);
      drivers.value = drivers.value.filter(d => d.id !== id);
    } catch (err) {
      console.error('Delete driver error:', err);
      throw err;
    }
  };

  const toggleStatus = async (id: string) => {
    const driver = drivers.value.find(d => d.id === id);
    if (!driver) return;
    
    try {
      const newStatus = !driver.isOnline;
      await api.patch(`/drivers/${id}`, { isOnline: newStatus });
      driver.isOnline = newStatus;
    } catch (err) {
      console.error('Toggle status error:', err);
      throw err;
    }
  };

  return { drivers, loading, fetchDrivers, addDriver, deleteDriver, toggleStatus };
});
