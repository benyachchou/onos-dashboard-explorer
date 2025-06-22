
import React from 'react';
import { Sidebar } from '@/components/navigation/Sidebar';
import { Dashboard } from '@/components/dashboard/Dashboard';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="flex w-full">
        <Sidebar />
        <main className="flex-1 overflow-hidden">
          <Dashboard />
        </main>
      </div>
    </div>
  );
};

export default Index;
