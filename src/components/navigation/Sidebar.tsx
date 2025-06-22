
import React, { useState } from 'react';
import { 
  Network, 
  Cpu, 
  Activity, 
  Settings, 
  Code, 
  Menu,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Activity,
      description: 'Vue d\'ensemble du réseau'
    },
    {
      id: 'topology',
      label: 'Topologie',
      icon: Network,
      description: 'Visualisation du réseau'
    },
    {
      id: 'devices',
      label: 'Appareils',
      icon: Cpu,
      description: 'Gestion des switches'
    },
    {
      id: 'flows',
      label: 'Flux OpenFlow',
      icon: Settings,
      description: 'Règles de flux'
    },
    {
      id: 'api',
      label: 'API Explorer',
      icon: Code,
      description: 'Requêtes personnalisées'
    }
  ];

  return (
    <div className={cn(
      "bg-white border-r border-gray-200 transition-all duration-300 shadow-lg",
      collapsed ? "w-16" : "w-64",
      className
    )}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {!collapsed && (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Network className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-lg font-bold text-gray-800">ONOS SDN</h1>
              </div>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {collapsed ? (
                <ChevronRight className="w-5 h-5 text-gray-600" />
              ) : (
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-200",
                  isActive 
                    ? "bg-blue-50 text-blue-600 border border-blue-200" 
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                )}
              >
                <Icon className={cn(
                  "w-5 h-5 flex-shrink-0",
                  isActive ? "text-blue-600" : "text-gray-500"
                )} />
                {!collapsed && (
                  <div className="text-left">
                    <div className="font-medium">{item.label}</div>
                    <div className="text-xs text-gray-500">{item.description}</div>
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Status */}
        <div className="p-4 border-t border-gray-200">
          <div className={cn(
            "flex items-center space-x-3",
            collapsed && "justify-center"
          )}>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            {!collapsed && (
              <span className="text-sm text-gray-600">Connecté à ONOS</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
