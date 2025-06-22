
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { onosApi } from '@/services/onosApi';
import { StatsCards } from './StatsCards';
import { TopologyView } from '../topology/TopologyView';
import { DevicesList } from '../devices/DevicesList';
import { FlowsTable } from '../flows/FlowsTable';
import { ApiExplorer } from '../api/ApiExplorer';
import { Activity, AlertCircle, Wifi, WifiOff } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'testing'>('testing');

  // Test connection status
  const { data: connectionTest } = useQuery({
    queryKey: ['connection-test'],
    queryFn: () => onosApi.testConnection(),
    refetchInterval: 30000,
    retry: 1,
  });

  // Fetch dashboard data with shorter intervals for real-time updates
  const { data: devices, isLoading: devicesLoading, error: devicesError } = useQuery({
    queryKey: ['devices'],
    queryFn: () => onosApi.getDevices(),
    refetchInterval: 5000, // Mise à jour toutes les 5 secondes
    retry: 2,
    retryDelay: 1000,
  });

  const { data: hosts, isLoading: hostsLoading, error: hostsError } = useQuery({
    queryKey: ['hosts'],
    queryFn: () => onosApi.getHosts(),
    refetchInterval: 5000,
    retry: 2,
    retryDelay: 1000,
  });

  const { data: links, isLoading: linksLoading, error: linksError } = useQuery({
    queryKey: ['links'],
    queryFn: () => onosApi.getLinks(),
    refetchInterval: 5000,
    retry: 2,
    retryDelay: 1000,
  });

  // Update connection status based on API responses
  useEffect(() => {
    if (connectionTest) {
      setConnectionStatus(connectionTest.success ? 'connected' : 'disconnected');
    }
  }, [connectionTest]);

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
  const isUsingRealData = devices?.success && hosts?.success && links?.success;

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
                  Surveillance et gestion du contrôleur SDN en temps réel
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
                  connectionStatus === 'connected' 
                    ? 'bg-green-100 text-green-800' 
                    : connectionStatus === 'disconnected'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {connectionStatus === 'connected' ? (
                    <Wifi className="w-4 h-4" />
                  ) : (
                    <WifiOff className="w-4 h-4" />
                  )}
                  <span>
                    {connectionStatus === 'connected' ? 'Connecté' : 
                     connectionStatus === 'disconnected' ? 'Déconnecté' : 'Test...'}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Activity className="w-4 h-4" />
                  <span>Dernière mise à jour: {new Date().toLocaleTimeString()}</span>
                </div>
              </div>
            </div>

            {!isUsingRealData && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h3 className="text-yellow-800 font-medium">Données de secours utilisées</h3>
                    <p className="text-yellow-700 mt-1 text-sm">
                      Impossible de récupérer les données du contrôleur ONOS. Vérifiez que le contrôleur est accessible 
                      et que les politiques CORS sont configurées correctement.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {isUsingRealData && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Wifi className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h3 className="text-green-800 font-medium">Données en temps réel</h3>
                    <p className="text-green-700 mt-1 text-sm">
                      Connecté au contrôleur ONOS. Les données sont mises à jour automatiquement toutes les 5 secondes.
                    </p>
                  </div>
                </div>
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
