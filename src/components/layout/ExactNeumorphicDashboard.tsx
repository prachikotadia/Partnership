import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { SimpleNavbar } from './SimpleNavbar';
import { NeumorphicInput } from '../ui/neumorphic-input-new';
import { NeumorphicButtonGrid } from '../ui/neumorphic-button-grid';
import { NeumorphicToggle } from '../ui/neumorphic-toggle';
import { NeumorphicSlider } from '../ui/neumorphic-slider';
import { NeumorphicCalendar } from '../ui/neumorphic-calendar';
import { NeumorphicProgress } from '../ui/neumorphic-progress';
import { NeumorphicChart } from '../ui/neumorphic-chart';
import { 
  Plus, 
  Minus, 
  Home, 
  Settings, 
  Search,
  Shield,
  BarChart3,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

interface ExactNeumorphicDashboardProps {
  userName?: string;
  partnerName?: string;
}

export const ExactNeumorphicDashboard: React.FC<ExactNeumorphicDashboardProps> = ({ 
  userName = "Person1", 
  partnerName = "Person2" 
}) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sliderValues, setSliderValues] = useState([30, 60, 80]);
  const [toggleValue, setToggleValue] = useState('Ipsum');

  const chartData = [
    { label: '2017', value: 40, highlighted: false },
    { label: '2018', value: 60, highlighted: false },
    { label: '2019', value: 80, highlighted: true },
    { label: '2020', value: 70, highlighted: false }
  ];

  const renderContent = () => {
    if (activeTab === 'dashboard') {
      return (
        <div className="space-y-8 p-6">
          {/* Top Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Input Fields */}
            <div className="space-y-4">
              <NeumorphicInput 
                type="dropdown"
                placeholder="Lorem Ipsum"
                options={['Dolor sit', 'Amet lorem', 'Ipsum dolor']}
              />
              <NeumorphicInput 
                placeholder="Lorem Ipsum"
              />
              <div className="bg-gray-100 rounded-2xl p-4 shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.8),inset_2px_2px_4px_rgba(0,0,0,0.1)]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">Lorem Ipsum</span>
                  <ArrowUp className="w-4 h-4 text-gray-500" />
                </div>
                <div className="space-y-2">
                  {['Dolor sit', 'Amet lorem', 'Ipsum dolor'].map((item, index) => (
                    <div key={index} className="px-3 py-2 rounded-xl hover:bg-gray-200 transition-colors text-sm text-gray-700">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <NeumorphicButtonGrid />
              <div className="space-y-3">
                <button className="w-full px-4 py-3 rounded-2xl bg-gradient-to-r from-teal-400 to-blue-500 text-white shadow-[inset_2px_2px_4px_rgba(0,0,0,0.2),inset_-2px_-2px_4px_rgba(255,255,255,0.2)] font-medium">
                  LOREM
                </button>
                <button className="w-full px-4 py-3 rounded-2xl bg-gray-100 shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.8),inset_2px_2px_4px_rgba(0,0,0,0.1)] text-gray-700 font-medium">
                  LOREM
                </button>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-4 h-4 rounded-full bg-gradient-to-r from-teal-400 to-blue-500 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.2),inset_-2px_-2px_4px_rgba(255,255,255,0.2)]" />
                <div className="w-4 h-4 rounded-full bg-gray-100 shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.8),inset_2px_2px_4px_rgba(0,0,0,0.1)]" />
              </div>
            </div>

            {/* Text Area */}
            <div>
              <textarea
                placeholder="Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet."
                className="w-full h-32 p-4 rounded-2xl bg-gray-100 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1),inset_-2px_-2px_4px_rgba(255,255,255,0.8)] border-0 focus:outline-none focus:ring-0 text-gray-700 placeholder-gray-500 resize-none"
              />
            </div>
          </div>

          {/* Middle Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Icon Buttons & List */}
            <div className="space-y-4">
              <div className="flex space-x-3">
                <button className="w-12 h-12 rounded-2xl bg-gray-100 shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.8),inset_2px_2px_4px_rgba(0,0,0,0.1)] hover:shadow-[inset_-1px_-1px_2px_rgba(255,255,255,0.8),inset_1px_1px_2px_rgba(0,0,0,0.1)] transition-all duration-200 flex items-center justify-center">
                  <Plus className="w-5 h-5 text-gray-600" />
                </button>
                <button className="w-12 h-12 rounded-2xl bg-gray-100 shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.8),inset_2px_2px_4px_rgba(0,0,0,0.1)] hover:shadow-[inset_-1px_-1px_2px_rgba(255,255,255,0.8),inset_1px_1px_2px_rgba(0,0,0,0.1)] transition-all duration-200 flex items-center justify-center">
                  <Home className="w-5 h-5 text-gray-600" />
                </button>
                <button className="w-12 h-12 rounded-2xl bg-gray-100 shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.8),inset_2px_2px_4px_rgba(0,0,0,0.1)] hover:shadow-[inset_-1px_-1px_2px_rgba(255,255,255,0.8),inset_1px_1px_2px_rgba(0,0,0,0.1)] transition-all duration-200 flex items-center justify-center">
                  <Settings className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              
              <div className="space-y-2">
                {[
                  { icon: Plus, title: "Lorem Ipsum dolor sit", subtitle: "Dolor sit", color: "teal" },
                  { icon: Minus, title: "Lorem Ipsum dolor sit", subtitle: "Dolor sit", color: "gray" },
                  { title: "Lorem Ipsum dolor sit", subtitle: "Dolor sit", color: "gray" }
                ].map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div key={index} className="flex items-center space-x-3 p-3 rounded-2xl bg-gray-100 shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.8),inset_2px_2px_4px_rgba(0,0,0,0.1)]">
                      {Icon && (
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                          item.color === 'teal' 
                            ? 'bg-gradient-to-r from-teal-400 to-blue-500' 
                            : 'bg-gray-200'
                        }`}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-700">{item.title}</div>
                        <div className="text-xs text-gray-500">{item.subtitle}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Search & Calendar */}
            <div className="space-y-4">
              <NeumorphicInput 
                type="search"
                placeholder="Search"
              />
              <NeumorphicCalendar />
            </div>

            {/* Sliders & Toggle */}
            <div className="space-y-6">
              <div className="space-y-4">
                {sliderValues.map((value, index) => (
                  <div key={index}>
                    <NeumorphicSlider 
                      value={value}
                      onChange={(newValue) => {
                        const newValues = [...sliderValues];
                        newValues[index] = newValue;
                        setSliderValues(newValues);
                      }}
                    />
                  </div>
                ))}
              </div>
              <NeumorphicToggle 
                options={['Ipsum', 'Dolor']}
                selected={toggleValue}
                onSelect={setToggleValue}
              />
            </div>
          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Toggles & Navigation */}
            <div className="space-y-4">
              <div className="flex space-x-2">
                {[true, false, true, false, true].map((active, index) => (
                  <div 
                    key={index}
                    className={`w-3 h-3 rounded-full ${
                      active 
                        ? 'bg-gradient-to-r from-teal-400 to-blue-500' 
                        : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-4 rounded-full bg-gradient-to-r from-teal-400 to-blue-500 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.2),inset_-2px_-2px_4px_rgba(255,255,255,0.2)]">
                    <div className="w-3 h-3 bg-white rounded-full shadow-md ml-0.5 mt-0.5" />
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="w-8 h-8 rounded-2xl bg-gray-100 shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.8),inset_2px_2px_4px_rgba(0,0,0,0.1)] hover:shadow-[inset_-1px_-1px_2px_rgba(255,255,255,0.8),inset_1px_1px_2px_rgba(0,0,0,0.1)] transition-all duration-200 flex items-center justify-center">
                  <ArrowUp className="w-4 h-4 text-gray-600" />
                </button>
                <button className="w-8 h-8 rounded-2xl bg-gray-100 shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.8),inset_2px_2px_4px_rgba(0,0,0,0.1)] hover:shadow-[inset_-1px_-1px_2px_rgba(255,255,255,0.8),inset_1px_1px_2px_rgba(0,0,0,0.1)] transition-all duration-200 flex items-center justify-center">
                  <ArrowDown className="w-4 h-4 text-gray-600" />
                </button>
                </div>
              </div>
            </div>

            {/* Progress & Icons */}
            <div className="space-y-4">
              <NeumorphicProgress value={76} label="Lorem ipsum" />
              <div className="flex space-x-3">
                <button className="w-12 h-12 rounded-2xl bg-gray-100 shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.8),inset_2px_2px_4px_rgba(0,0,0,0.1)] hover:shadow-[inset_-1px_-1px_2px_rgba(255,255,255,0.8),inset_1px_1px_2px_rgba(0,0,0,0.1)] transition-all duration-200 flex items-center justify-center">
                  <Search className="w-5 h-5 text-gray-600" />
                </button>
                <button className="w-12 h-12 rounded-2xl bg-gray-100 shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.8),inset_2px_2px_4px_rgba(0,0,0,0.1)] hover:shadow-[inset_-1px_-1px_2px_rgba(255,255,255,0.8),inset_1px_1px_2px_rgba(0,0,0,0.1)] transition-all duration-200 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-gray-600" />
                </button>
                <button className="w-12 h-12 rounded-2xl bg-gray-100 shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.8),inset_2px_2px_4px_rgba(0,0,0,0.1)] hover:shadow-[inset_-1px_-1px_2px_rgba(255,255,255,0.8),inset_1px_1px_2px_rgba(0,0,0,0.1)] transition-all duration-200 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Chart */}
            <div>
              <NeumorphicChart data={chartData} />
            </div>
          </div>
        </div>
      );
    }

    // For other tabs, show a simple message
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4">🚧</div>
          <h3 className="text-xl font-semibold mb-2">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h3>
          <p className="text-gray-600 dark:text-gray-400">This section is coming soon!</p>
        </div>
      </div>
    );
  };

  return (
    <div className={`
      min-h-screen transition-colors duration-300
      ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}
    `}>
      <SimpleNavbar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="lg:ml-20">
        {renderContent()}
      </main>
    </div>
  );
};
