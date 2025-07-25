import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { Button } from './ui/button';
import { Menu } from 'lucide-react';

const DashboardLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="h-screen w-full flex overflow-hidden bg-background">
      {/* Mobile Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Sidebar */}
      <aside 
        className={`
          fixed top-0 left-0 z-40 h-screen
          transition-transform duration-300 ease-in-out
          bg-background border-r
          w-64
          lg:relative lg:translate-x-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      </aside>

      {/* Main Content */}
      <main className={`
        flex-1 h-screen overflow-auto
        transition-all duration-300 ease-in-out
        ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-0'}
        w-full
      `}>
        {children}
      </main>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default DashboardLayout;
