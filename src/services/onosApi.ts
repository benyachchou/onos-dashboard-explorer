
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
  }
});

export const onosApi = {
  // Devices
  async getDevices(): Promise<ApiResponse<ONOSDevice[]>> {
    try {
      const response = await api.get('/devices');
      return {
        data: response.data.devices || [],
        success: true
      };
    } catch (error) {
      console.error('Error fetching devices:', error);
      return {
        data: [],
        success: false,
        error: 'Failed to fetch devices'
      };
    }
  },

  async getDevice(deviceId: string): Promise<ApiResponse<ONOSDevice>> {
    try {
      const response = await api.get(`/devices/${deviceId}`);
      return {
        data: response.data,
        success: true
      };
    } catch (error) {
      console.error('Error fetching device:', error);
      return {
        data: {} as ONOSDevice,
        success: false,
        error: 'Failed to fetch device'
      };
    }
  },

  // Links
  async getLinks(): Promise<ApiResponse<ONOSLink[]>> {
    try {
      const response = await api.get('/links');
      return {
        data: response.data.links || [],
        success: true
      };
    } catch (error) {
      console.error('Error fetching links:', error);
      return {
        data: [],
        success: false,
        error: 'Failed to fetch links'
      };
    }
  },

  // Hosts
  async getHosts(): Promise<ApiResponse<ONOSHost[]>> {
    try {
      const response = await api.get('/hosts');
      return {
        data: response.data.hosts || [],
        success: true
      };
    } catch (error) {
      console.error('Error fetching hosts:', error);
      return {
        data: [],
        success: false,
        error: 'Failed to fetch hosts'
      };
    }
  },

  // Flows
  async getFlows(deviceId?: string): Promise<ApiResponse<ONOSFlow[]>> {
    try {
      const endpoint = deviceId ? `/flows/${deviceId}` : '/flows';
      const response = await api.get(endpoint);
      return {
        data: response.data.flows || [],
        success: true
      };
    } catch (error) {
      console.error('Error fetching flows:', error);
      return {
        data: [],
        success: false,
        error: 'Failed to fetch flows'
      };
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
      return {
        data: null,
        success: false,
        error: 'Failed to execute request'
      };
    }
  },

  // Topology data
  async getTopologyData(): Promise<ApiResponse<any>> {
    try {
      const [devicesRes, linksRes, hostsRes] = await Promise.all([
        this.getDevices(),
        this.getLinks(),
        this.getHosts()
      ]);

      if (!devicesRes.success || !linksRes.success || !hostsRes.success) {
        throw new Error('Failed to fetch topology data');
      }

      return {
        data: {
          devices: devicesRes.data,
          links: linksRes.data,
          hosts: hostsRes.data
        },
        success: true
      };
    } catch (error) {
      console.error('Error fetching topology data:', error);
      return {
        data: null,
        success: false,
        error: 'Failed to fetch topology data'
      };
    }
  }
};
