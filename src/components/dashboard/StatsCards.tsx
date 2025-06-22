
import React from 'react';
import { ONOSDevice, ONOSHost, ONOSLink } from '@/types/onos';
import { Cpu, Users, Link, Activity, TrendingUp, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardsProps {
  devices: ONOSDevice[];
  hosts: ONOSHost[];
  links: ONOSLink[];
  loading: boolean;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ 
  devices, 
  hosts, 
  links, 
  loading 
}) => {
  const activeDevices = devices.filter(d => d.available).length;
  const inactiveDevices = devices.length - activeDevices;
  const activeLinks = links.filter(l => l.state === 'ACTIVE').length;

  const stats = [
    {
      title: 'Switches Actifs',
      value: activeDevices,
      total: devices.length,
      icon: Cpu,
      color: 'blue',
      trend: '+2.1%',
      description: `${inactiveDevices} inactifs`
    },
    {
      title: 'Hôtes Connectés',
      value: hosts.length,
      total: hosts.length,
      icon: Users,
      color: 'green',
      trend: '+5.4%',
      description: 'Tous actifs'
    },
    {
      title: 'Liens Réseau',
      value: activeLinks,
      total: links.length,
      icon: Link,
      color: 'purple',
      trend: '+1.2%',
      description: `${links.length - activeLinks} inactifs`
    },
    {
      title: 'Performances',
      value: Math.round((activeDevices / Math.max(devices.length, 1)) * 100),
      total: 100,
      icon: Activity,
      color: 'orange',
      trend: '+0.8%',
      description: 'Disponibilité',
      suffix: '%'
    }
  ];

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: 'bg-blue-50 text-blue-600 border-blue-200',
      green: 'bg-green-50 text-green-600 border-green-200',
      purple: 'bg-purple-50 text-purple-600 border-purple-200',
      orange: 'bg-orange-50 text-orange-600 border-orange-200'
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  const getIconBgClasses = (color: string) => {
    const colorMap = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      purple: 'bg-purple-500',
      orange: 'bg-orange-500'
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
                <div className="h-3 bg-gray-200 rounded w-20"></div>
              </div>
              <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        
        return (
          <div
            key={index}
            className={cn(
              "bg-white rounded-lg border p-6 transition-all duration-200 hover:shadow-md",
              getColorClasses(stat.color)
            )}
          >
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <div className="flex items-baseline space-x-2">
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                    {stat.suffix}
                  </p>
                  {stat.total !== stat.value && !stat.suffix && (
                    <span className="text-sm text-gray-500">/ {stat.total}</span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-medium text-green-600 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {stat.trend}
                  </span>
                  <span className="text-xs text-gray-500">{stat.description}</span>
                </div>
              </div>
              
              <div className={cn(
                "w-12 h-12 rounded-lg flex items-center justify-center",
                getIconBgClasses(stat.color)
              )}>
                <Icon className="w-6 h-6 text-white" />
              </div>
            </div>
            
            {/* Progress bar for availability */}
            {stat.suffix === '%' && (
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={cn(
                      "h-2 rounded-full transition-all duration-500",
                      `bg-${stat.color}-500`
                    )}
                    style={{ width: `${stat.value}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
