
import React from 'react';
import { Home, Eye, GraduationCap, Users, Map, MessageSquare } from 'lucide-react';
import { AppTab } from '../types';

interface NavigationProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: AppTab.HOME, icon: Home, label: 'Inicio' },
    { id: AppTab.MONITORING, icon: Eye, label: 'Monitoreo' },
    { id: AppTab.EDUCATION, icon: GraduationCap, label: 'Educación' },
    { id: AppTab.PARTICIPATION, icon: Users, label: 'Comunidad' },
    { id: AppTab.CULTURE, icon: Map, label: 'Memoria' },
    { id: AppTab.CHAT, icon: MessageSquare, label: 'Bot' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-emerald-100 flex justify-around items-center px-2 py-3 pb-6 shadow-lg z-50">
      {navItems.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          onClick={() => setActiveTab(id)}
          className={`flex flex-col items-center gap-1 transition-colors ${
            activeTab === id ? 'text-emerald-600' : 'text-gray-400'
          }`}
        >
          <Icon size={24} className={activeTab === id ? 'fill-emerald-100' : ''} />
          <span className="text-[10px] font-medium uppercase tracking-tighter">{label}</span>
        </button>
      ))}
    </nav>
  );
};

export default Navigation;
