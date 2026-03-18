
import React from 'react';
import { Home, Eye, GraduationCap, Users, Map, MessageSquare } from 'lucide-react';
import { AppTab } from '../types';
import { useLanguage } from './LanguageContext';

interface NavigationProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab }) => {
  const { t } = useLanguage();

  const navItems = [
    { id: AppTab.HOME, icon: Home, labelKey: 'nav.home', fallback: 'Inicio' },
    { id: AppTab.MONITORING, icon: Eye, labelKey: 'nav.monitoring', fallback: 'Monitoreo' },
    { id: AppTab.EDUCATION, icon: GraduationCap, labelKey: 'nav.education', fallback: 'Educación' },
    { id: AppTab.PARTICIPATION, icon: Users, labelKey: 'nav.community', fallback: 'Comunidad' },
    { id: AppTab.CULTURE, icon: Map, labelKey: 'nav.memory', fallback: 'Memoria' },
    { id: AppTab.CHAT, icon: MessageSquare, labelKey: 'nav.bot', fallback: 'Bot' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-emerald-100 flex justify-around items-center px-2 py-3 pb-6 shadow-lg z-50">
      {navItems.map(({ id, icon: Icon, labelKey, fallback }) => (
        <button
          key={id}
          onClick={() => setActiveTab(id)}
          className={`flex flex-col items-center gap-1 transition-colors ${
            activeTab === id ? 'text-emerald-600' : 'text-gray-400'
          }`}
        >
          <Icon size={24} className={activeTab === id ? 'fill-emerald-100' : ''} />
          <span className="text-[10px] font-medium uppercase tracking-tighter">
            {t(labelKey, fallback)}
          </span>
        </button>
      ))}
    </nav>
  );
};

export default Navigation;
