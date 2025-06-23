
import axios, { AxiosResponse } from 'axios';
import { ONOSDevice, ONOSLink, ONOSHost, ONOSFlow, ApiResponse, HttpMethod } from '@/types/onos';

const ONOS_API_BASE = 'http://192.168.94.129:8181/onos/v1';

const api = axios.create({
  baseURL: ONOS_API_BASE,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
  auth: {
    username: 'onos',
    password: 'rocks'
  },
  timeout: 15000,
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log(`Making API request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log(`API response received: ${response.status} ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    console.error('Response error:', error);
    if (error.code === 'ERR_NETWORK') {
      console.error('Network error - this might be a CORS issue or network connectivity problem');
    }
    return Promise.reject(error);
  }
);

export const onosApi = {
  // Test connection
  async testConnection(): Promise<ApiResponse<any>> {
    try {
      const response = await api.get('/');
      console.log('Connection test successful:', response.data);
      return {
        data: response.data,
        success: true
      };
    } catch (error) {
      console.error('Connection test failed:', error);
      return {
        data: null,
        success: false,
        error: 'Failed to connect to ONOS controller'
      };
    }
  },

  // Devices
  async getDevices(): Promise<ApiResponse<ONOSDevice[]>> {
    try {
      const response = await api.get('/devices');
      console.log('Real devices response:', response.data);
      
      // Transform the response to match our interface
      const devices = response.data.devices?.map((device: any) => ({
        ...device,
        lastUpdate: new Date().toISOString(),
        humanReadableLastUpdate: 'Mis à jour maintenant'
      })) || [];

      return {
        data: devices,
        success: true
      };
    } catch (error) {
      console.error('Error fetching devices:', error);
      throw error;
    }
  },

  async getDevice(deviceId: string): Promise<ApiResponse<ONOSDevice>> {
    try {
      const response = await api.get(`/devices/${deviceId}`);
      console.log('Real device response:', response.data);
      return {
        data: {
          ...response.data,
          lastUpdate: new Date().toISOString(),
          humanReadableLastUpdate: 'Mis à jour maintenant'
        },
        success: true
      };
    } catch (error) {
      console.error('Error fetching device:', error);
      throw error;
    }
  },

  // Links
  async getLinks(): Promise<ApiResponse<ONOSLink[]>> {
    try {
      const response = await api.get('/links');
      console.log('Real links response:', response.data);
      return {
        data: response.data.links || [],
        success: true
      };
    } catch (error) {
      console.error('Error fetching links:', error);
      throw error;
    }
  },

  // Hosts
  async getHosts(): Promise<ApiResponse<ONOSHost[]>> {
    try {
      const response = await api.get('/hosts');
      console.log('Real hosts response:', response.data);
      return {
        data: response.data.hosts || [],
        success: true
      };
    } catch (error) {
      console.error('Error fetching hosts:', error);
      throw error;
    }
  },

  // Flows
  async getFlows(deviceId?: string): Promise<ApiResponse<ONOSFlow[]>> {
    try {
      const endpoint = deviceId ? `/flows/${deviceId}` : '/flows';
      const response = await api.get(endpoint);
      console.log('Real flows response:', response.data);
      return {
        data: response.data.flows || [],
        success: true
      };
    } catch (error) {
      console.error('Error fetching flows:', error);
      throw error;
    }
  },

  // Custom API request
  async customRequest(
    method: HttpMethod,
    endpoint: string,
    data?: any,
    params?: Record<string, string>
  ): Promise<ApiResponse<any>> {
    try {
      let url = endpoint;
      if (params) {
        Object.keys(params).forEach(key => {
          url = url.replace(`{${key}}`, params[key]);
        });
      }

      console.log(`Real custom request: ${method} ${url}`, data);

      let response: AxiosResponse;
      switch (method) {
        case 'GET':
          response = await api.get(url);
          break;
        case 'POST':
          response = await api.post(url, data);
          break;
        case 'PUT':
          response = await api.put(url, data);
          break;
        case 'DELETE':
          response = await api.delete(url);
          break;
        default:
          throw new Error(`Unsupported method: ${method}`);
      }

      return {
        data: response.data,
        success: true
      };
    } catch (error) {
      console.error('Error executing custom request:', error);
      throw error;
    }
  },

  // Topology data
  async getTopologyData(): Promise<ApiResponse<any>> {
    try {
      console.log('Fetching real topology data...');
      const [devicesRes, linksRes, hostsRes] = await Promise.all([
        this.getDevices(),
        this.getLinks(),
        this.getHosts()
      ]);

      console.log('Real topology results:', { devicesRes, linksRes, hostsRes });

      return {
        data: {
          devices: devicesRes.data,
          links: linksRes.data,
          hosts: hostsRes.data
        },
        success: devicesRes.success && linksRes.success && hostsRes.success
      };
    } catch (error) {
      console.error('Error fetching topology data:', error);
      throw error;
    }
  }
};
