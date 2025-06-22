
export interface ONOSDevice {
  id: string;
  type: string;
  available: boolean;
  role: string;
  mfr: string;
  hw: string;
  sw: string;
  serial: string;
  driver: string;
  chassisId: string;
  lastUpdate: string;
  humanReadableLastUpdate: string;
  ports?: ONOSPort[];
}

export interface ONOSPort {
  port: string;
  isEnabled: boolean;
  type: string;
  portSpeed: number;
  annotations: Record<string, string>;
}

export interface ONOSLink {
  src: {
    device: string;
    port: string;
  };
  dst: {
    device: string;
    port: string;
  };
  type: string;
  state: string;
}

export interface ONOSHost {
  id: string;
  mac: string;
  vlan: string;
  innerVlan: string;
  outerTpid: string;
  configured: boolean;
  suspended: boolean;
  ipAddresses: string[];
  locations: Array<{
    elementId: string;
    port: string;
  }>;
}

export interface ONOSFlow {
  id: string;
  deviceId: string;
  tableId: number;
  priority: number;
  timeout: number;
  isPermanent: boolean;
  selector: Record<string, any>;
  treatment: Record<string, any>;
  appId: string;
  groupId?: number;
  state: string;
  life: number;
  packets: number;
  bytes: number;
  lastSeen: number;
}

export interface TopologyData {
  nodes: TopologyNode[];
  edges: TopologyEdge[];
}

export interface TopologyNode {
  id: string;
  label: string;
  type: 'device' | 'host';
  color: string;
  shape: string;
  status?: 'online' | 'offline';
}

export interface TopologyEdge {
  from: string;
  to: string;
  label?: string;
  arrows?: string;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export interface ApiEndpoint {
  path: string;
  methods: HttpMethod[];
  description?: string;
}
