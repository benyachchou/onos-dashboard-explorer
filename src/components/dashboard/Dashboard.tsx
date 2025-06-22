
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

  // Fetch dashboard data with error handling
  const { data: devices, isLoading: devicesLoading, error: devicesError } = useQuery({
    queryKey: ['devices'],
    queryFn: () => onosApi.getDevices(),
    refetchInterval: 30000,
    retry: 3,
    retryDelay: 1000,
  });

  const { data: hosts, isLoading: hostsLoading, error: hostsError } = useQuery({
    queryKey: ['hosts'],
    queryFn: () => onosApi.getHosts(),
    refetchInterval: 30000,
    retry: 3,
    retryDelay: 1000,
  });

  const { data: links, isLoading: linksLoading, error: linksError } = useQuery({
    queryKey: ['links'],
    queryFn: () => onosApi.getLinks(),
    refetchInterval: 30000,
    retry: 3,
    retryDelay: 1000,
  });

  // Listen for navigation changes
  useEffect(() => {
    const handleNavigation = (event: CustomEvent) => {
      console.log('Navigation event received:', event.detail.view);
      setActiveView(event.detail.view);
    };

    window.addEventListener('navigate-to', handleNavigation as EventListener);
    return () => {
      window.removeEventListener('navigate-to', handleNavigation as EventListener);
    };
  }, []);

  const hasErrors = devicesError || hostsError || linksError;

  const renderContent = () => {
    console.log('Rendering view:', activeView);
    
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

            {hasErrors && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <h3 className="text-red-800 font-medium">Erreurs de connexion API</h3>
                </div>
                <p className="text-red-700 mt-1">
                  Impossible de se connecter au contrôleur ONOS. Vérifiez que le contrôleur est accessible sur http://192.168.94.129:8181
                </p>
              </div>
            )}
            
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

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-7xl mx-auto p-6">
        {renderContent()}
      </div>
    </div>
  );
};
