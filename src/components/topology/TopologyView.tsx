
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { onosApi } from '@/services/onosApi';
import { Network, RefreshCw, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TopologyViewProps {
  compact?: boolean;
}

export const TopologyView: React.FC<TopologyViewProps> = ({ compact = false }) => {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const { data: topologyData, isLoading, refetch } = useQuery({
    queryKey: ['topology'],
    queryFn: () => onosApi.getTopologyData(),
  });

  const handleRefresh = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <div className={cn(
        "bg-white rounded-lg border border-gray-200 p-6",
        compact ? "h-64" : "h-96"
      )}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <Network className="w-12 h-12 text-gray-400 mx-auto mb-4 animate-pulse" />
            <p className="text-gray-500">Chargement de la topologie...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!topologyData?.success) {
    return (
      <div className={cn(
        "bg-white rounded-lg border border-gray-200 p-6",
        compact ? "h-64" : "h-96"
      )}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <Zap className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-500">Erreur lors du chargement</p>
            <button
              onClick={handleRefresh}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { devices = [], hosts = [], links = [] } = topologyData.data || {};

  return (
    <div className={cn(
      "bg-white rounded-lg border border-gray-200",
      !compact && "p-6"
    )}>
      {!compact && (
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Topologie Réseau</h2>
          <button
            onClick={handleRefresh}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Actualiser</span>
          </button>
        </div>
      )}

      <div className={cn(
        "relative bg-gray-50 rounded-lg border-2 border-dashed border-gray-200",
        compact ? "h-48" : "h-80"
      )}>
        {/* Simplified topology visualization */}
        <div className="absolute inset-0 p-4 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="grid grid-cols-3 gap-8 items-center">
              {/* Devices */}
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500 rounded-lg mx-auto mb-2 flex items-center justify-center">
                  <Network className="w-8 h-8 text-white" />
                </div>
                <p className="text-sm font-medium text-gray-700">Switches</p>
                <p className="text-xs text-gray-500">{devices.length} appareils</p>
              </div>

              {/* Links indicator */}
              <div className="text-center">
                <div className="h-1 w-16 bg-gradient-to-r from-blue-500 to-green-500 rounded-full mx-auto mb-2"></div>
                <p className="text-sm font-medium text-gray-700">Liens</p>
                <p className="text-xs text-gray-500">{links.length} connexions</p>
              </div>

              {/* Hosts */}
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500 rounded-lg mx-auto mb-2 flex items-center justify-center">
                  <div className="w-8 h-8 bg-white rounded-full"></div>
                </div>
                <p className="text-sm font-medium text-gray-700">Hôtes</p>
                <p className="text-xs text-gray-500">{hosts.length} connectés</p>
              </div>
            </div>

            {!compact && (
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">
                  Visualisation complète disponible dans l'onglet Topologie
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {!compact && (
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{devices.length}</p>
            <p className="text-sm text-gray-600">Switches</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">{hosts.length}</p>
            <p className="text-sm text-gray-600">Hôtes</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-2xl font-bold text-purple-600">{links.length}</p>
            <p className="text-sm text-gray-600">Liens</p>
          </div>
        </div>
      )}
    </div>
  );
};
