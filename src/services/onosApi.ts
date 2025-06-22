
import axios, { AxiosResponse } from 'axios';
import { ONOSDevice, ONOSLink, ONOSHost, ONOSFlow, ApiResponse, HttpMethod } from '@/types/onos';

const ONOS_API_BASE = 'http://192.168.94.129:8181/onos/v1';

// Mode simulation désactivé pour utiliser l'API réelle
const DEMO_MODE = false;

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
  timeout: 10000, // Augmenté à 10 secondes
});

// Données de démonstration
const demoDevices: ONOSDevice[] = [
  {
    id: 'of:0000000000000001',
    type: 'SWITCH',
    available: true,
    role: 'MASTER',
    mfr: 'Open vSwitch',
    hw: 'Open vSwitch',
    sw: '2.13.3',
    serial: 'None',
    driver: 'ovs',
    chassisId: '1',
    lastUpdate: new Date().toISOString(),
    humanReadableLastUpdate: 'Il y a quelques secondes'
  },
  {
    id: 'of:0000000000000002',
    type: 'SWITCH',
    available: true,
    role: 'MASTER',
    mfr: 'Open vSwitch',
    hw: 'Open vSwitch',
    sw: '2.13.3',
    serial: 'None',
    driver: 'ovs',
    chassisId: '2',
    lastUpdate: new Date().toISOString(),
    humanReadableLastUpdate: 'Il y a quelques secondes'
  }
];

const demoHosts: ONOSHost[] = [
  {
    id: '00:00:00:00:00:01/None',
    mac: '00:00:00:00:00:01',
    vlan: 'None',
    innerVlan: 'None',
    outerTpid: '0x8100',
    configured: false,
    suspended: false,
    ipAddresses: ['10.0.0.1'],
    locations: [{
      elementId: 'of:0000000000000001',
      port: '1'
    }]
  },
  {
    id: '00:00:00:00:00:02/None',
    mac: '00:00:00:00:00:02',
    vlan: 'None',
    innerVlan: 'None',
    outerTpid: '0x8100',
    configured: false,
    suspended: false,
    ipAddresses: ['10.0.0.2'],
    locations: [{
      elementId: 'of:0000000000000002',
      port: '1'
    }]
  }
];

const demoLinks: ONOSLink[] = [
  {
    src: {
      device: 'of:0000000000000001',
      port: '2'
    },
    dst: {
      device: 'of:0000000000000002',
      port: '2'
    },
    type: 'DIRECT',
    state: 'ACTIVE'
  }
];

const demoFlows: ONOSFlow[] = [
  {
    id: '1',
    deviceId: 'of:0000000000000001',
    tableId: 0,
    priority: 40000,
    timeout: 0,
    isPermanent: true,
    selector: { ethType: '0x800' },
    treatment: { instructions: [{ type: 'OUTPUT', port: 'CONTROLLER' }] },
    appId: 'org.onosproject.core',
    state: 'ADDED',
    life: 12345,
    packets: 100,
    bytes: 6400,
    lastSeen: Date.now()
  }
];

// Simuler un délai réseau
const simulateNetworkDelay = () => new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));

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

// Add response interceptor for debugging and CORS handling
api.interceptors.response.use(
  (response) => {
    console.log(`API response received: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('Response error:', error);
    if (error.code === 'ERR_NETWORK') {
      console.error('Network error - this might be a CORS issue or network connectivity problem');
    }
    
    // Fallback to demo data if real API fails
    if (!DEMO_MODE) {
      console.warn('API call failed, falling back to demo data for this request');
    }
    
    return Promise.reject(error);
  }
);

export const onosApi = {
  // Test connection
  async testConnection(): Promise<ApiResponse<any>> {
    if (DEMO_MODE) {
      await simulateNetworkDelay();
      console.log('Mode démonstration: Connexion simulée réussie');
      return {
        data: { status: 'Demo mode active' },
        success: true
      };
    }

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
        error: 'Failed to connect to ONOS controller - check CORS configuration'
      };
    }
  },

  // Devices
  async getDevices(): Promise<ApiResponse<ONOSDevice[]>> {
    if (DEMO_MODE) {
      await simulateNetworkDelay();
      console.log('Mode démonstration: Retour des appareils factices');
      return {
        data: demoDevices,
        success: true
      };
    }

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
      console.error('Error fetching real devices, falling back to demo data:', error);
      return {
        data: demoDevices,
        success: false,
        error: 'Failed to fetch devices from ONOS API - using demo data'
      };
    }
  },

  async getDevice(deviceId: string): Promise<ApiResponse<ONOSDevice>> {
    if (DEMO_MODE) {
      await simulateNetworkDelay();
      const device = demoDevices.find(d => d.id === deviceId);
      return {
        data: device || demoDevices[0],
        success: true
      };
    }

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
      console.error('Error fetching real device, falling back to demo data:', error);
      const device = demoDevices.find(d => d.id === deviceId);
      return {
        data: device || demoDevices[0],
        success: false,
        error: 'Failed to fetch device from ONOS API - using demo data'
      };
    }
  },

  // Links
  async getLinks(): Promise<ApiResponse<ONOSLink[]>> {
    if (DEMO_MODE) {
      await simulateNetworkDelay();
      console.log('Mode démonstration: Retour des liens factices');
      return {
        data: demoLinks,
        success: true
      };
    }

    try {
      const response = await api.get('/links');
      console.log('Real links response:', response.data);
      return {
        data: response.data.links || [],
        success: true
      };
    } catch (error) {
      console.error('Error fetching real links, falling back to demo data:', error);
      return {
        data: demoLinks,
        success: false,
        error: 'Failed to fetch links from ONOS API - using demo data'
      };
    }
  },

  // Hosts
  async getHosts(): Promise<ApiResponse<ONOSHost[]>> {
    if (DEMO_MODE) {
      await simulateNetworkDelay();
      console.log('Mode démonstration: Retour des hôtes factices');
      return {
        data: demoHosts,
        success: true
      };
    }

    try {
      const response = await api.get('/hosts');
      console.log('Real hosts response:', response.data);
      return {
        data: response.data.hosts || [],
        success: true
      };
    } catch (error) {
      console.error('Error fetching real hosts, falling back to demo data:', error);
      return {
        data: demoHosts,
        success: false,
        error: 'Failed to fetch hosts from ONOS API - using demo data'
      };
    }
  },

  // Flows
  async getFlows(deviceId?: string): Promise<ApiResponse<ONOSFlow[]>> {
    if (DEMO_MODE) {
      await simulateNetworkDelay();
      const flows = deviceId ? demoFlows.filter(f => f.deviceId === deviceId) : demoFlows;
      return {
        data: flows,
        success: true
      };
    }

    try {
      const endpoint = deviceId ? `/flows/${deviceId}` : '/flows';
      const response = await api.get(endpoint);
      console.log('Real flows response:', response.data);
      return {
        data: response.data.flows || [],
        success: true
      };
    } catch (error) {
      console.error('Error fetching real flows, falling back to demo data:', error);
      const flows = deviceId ? demoFlows.filter(f => f.deviceId === deviceId) : demoFlows;
      return {
        data: flows,
        success: false,
        error: 'Failed to fetch flows from ONOS API - using demo data'
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
    if (DEMO_MODE) {
      await simulateNetworkDelay();
      console.log(`Mode démonstration: Requête simulée ${method} ${endpoint}`);
      
      // Simuler des réponses selon l'endpoint
      if (endpoint.includes('/devices')) {
        return { data: { devices: demoDevices }, success: true };
      } else if (endpoint.includes('/hosts')) {
        return { data: { hosts: demoHosts }, success: true };
      } else if (endpoint.includes('/links')) {
        return { data: { links: demoLinks }, success: true };
      } else if (endpoint.includes('/flows')) {
        return { data: { flows: demoFlows }, success: true };
      }
      
      return {
        data: { message: 'Demo request successful', endpoint, method },
        success: true
      };
    }

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
      console.error('Error executing real custom request:', error);
      return {
        data: null,
        success: false,
        error: 'Failed to execute request on ONOS API'
      };
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
      console.error('Error fetching real topology data:', error);
      return {
        data: {
          devices: demoDevices,
          links: demoLinks,
          hosts: demoHosts
        },
        success: false,
        error: 'Failed to fetch topology data from ONOS API - using demo data'
      };
    }
  }
};
