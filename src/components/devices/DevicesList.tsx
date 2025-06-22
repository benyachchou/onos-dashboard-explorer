
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { onosApi } from '@/services/onosApi';
import { Cpu, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DevicesListProps {
  compact?: boolean;
}

export const DevicesList: React.FC<DevicesListProps> = ({ compact = false }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['devices'],
    queryFn: () => onosApi.getDevices(),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 border border-gray-200 rounded-lg animate-pulse">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="h-3 bg-gray-200 rounded w-48"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const devices = data?.data || [];
  const displayDevices = compact ? devices.slice(0, 3) : devices;

  return (
    <div className="space-y-4">
      {!compact && (
        <h2 className="text-2xl font-bold text-gray-900">Appareils ONOS</h2>
      )}
      
      <div className="space-y-3">
        {displayDevices.map((device) => (
          <div
            key={device.id}
            className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center",
                  device.available ? "bg-green-500" : "bg-red-500"
                )}>
                  <Cpu className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {device.id.split(':')[1] || device.id}
                  </p>
                  <p className="text-sm text-gray-500">
                    {device.mfr} - {device.type}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {device.available ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
                <span className={cn(
                  "px-2 py-1 rounded-full text-xs font-medium",
                  device.available 
                    ? "bg-green-100 text-green-800" 
                    : "bg-red-100 text-red-800"
                )}>
                  {device.available ? 'Actif' : 'Inactif'}
                </span>
              </div>
            </div>
          </div>
        ))}
        
        {compact && devices.length > 3 && (
          <div className="text-center">
            <p className="text-sm text-gray-500">
              +{devices.length - 3} autres appareils
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
