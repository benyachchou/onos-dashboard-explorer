
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { onosApi } from '@/services/onosApi';
import { StatsCards } from './StatsCards';
import { TopologyView } from '../topology/TopologyView';
import { DevicesList } from '../devices/DevicesList';
import { FlowsTable } from '../flows/FlowsTable';
import { ApiExplorer } from '../api/ApiExplorer';
import { Activity, AlertCircle } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [activeView, setActiveView] = useState('dashboard');

  // Fetch dashboard data
  const { data: devices, isLoading: devicesLoading } = useQuery({
    queryKey: ['devices'],
    queryFn: () => onosApi.getDevices(),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: hosts, isLoading: hostsLoading } = useQuery({
    queryKey: ['hosts'],
    queryFn: () => onosApi.getHosts(),
    refetchInterval: 30000,
  });

  const { data: links, isLoading: linksLoading } = useQuery({
    queryKey: ['links'],
    queryFn: () => onosApi.getLinks(),
    refetchInterval: 30000,
  });

  const renderContent = () => {
    switch (activeView) {
      case 'topology':
        return <TopologyView />;
      case 'devices':
        return <DevicesList />;
      case 'flows':
        return <FlowsTable />;
      case 'api':
        return <ApiExplorer />;
      default:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Tableau de bord ONOS</h1>
                <p className="text-gray-600 mt-1">
                  Surveillance et gestion du contrôleur SDN
                </p>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Activity className="w-4 h-4" />
                <span>Dernière mise à jour: {new Date().toLocaleTimeString()}</span>
              </div>
            </div>
            
            <StatsCards 
              devices={devices?.data || []}
              hosts={hosts?.data || []}
              links={links?.data || []}
              loading={devicesLoading || hostsLoading || linksLoading}
            />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4">Aperçu de la Topologie</h3>
                <TopologyView compact />
              </div>
              
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4">Appareils Récents</h3>
                <DevicesList compact />
              </div>
            </div>
          </div>
        );
    }
  };

  // Listen for navigation changes
  React.useEffect(() => {
    const handleNavigation = (event: CustomEvent) => {
      setActiveView(event.detail.view);
    };

    window.addEventListener('navigate-to', handleNavigation as EventListener);
    return () => {
      window.removeEventListener('navigate-to', handleNavigation as EventListener);
    };
  }, []);

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-7xl mx-auto p-6">
        {renderContent()}
      </div>
    </div>
  );
};
