import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';

export const MainLayout: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="min-h-screen bg-neutral-background">
      <Header 
        onToggleSidebar={handleToggleSidebar}
        isSidebarCollapsed={isSidebarCollapsed}
      />
      
      <div className="flex">
        <Sidebar isCollapsed={isSidebarCollapsed} />
        
        <main className={`flex-1 transition-all duration-200 ${
          isSidebarCollapsed ? 'ml-sidebar-collapsed' : 'ml-sidebar'
        }`}>
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
