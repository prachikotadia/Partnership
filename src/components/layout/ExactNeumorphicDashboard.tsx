import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { NeumorphicInput } from '../ui/neumorphic-input';
import { NeumorphicDropdown } from '../ui/neumorphic-dropdown';
import { NeumorphicButton } from '../ui/neumorphic-button';
import { NeumorphicToggle } from '../ui/neumorphic-toggle';
import { NeumorphicSlider } from '../ui/neumorphic-slider';
import { NeumorphicProgress } from '../ui/neumorphic-progress';
import { NeumorphicCalendar } from '../ui/neumorphic-calendar';
import { NeumorphicChart } from '../ui/neumorphic-chart';
import { 
  ChevronDown, 
  ChevronUp, 
  Check, 
  ArrowUp, 
  Menu, 
  Square, 
  ArrowDown, 
  X,
  Plus,
  Home,
  Settings,
  Minus,
  Search,
  Shield,
  BarChart3
} from 'lucide-react';

export const ExactNeumorphicDashboard: React.FC = () => {
  const { theme } = useTheme();
  const [sliderValues, setSliderValues] = useState([30, 60, 80]);
  const [toggleValue, setToggleValue] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [searchValue, setSearchValue] = useState('');

  const dropdownOptions = [
    { value: 'dolor-sit', label: 'Dolor sit' },
    { value: 'amet-lorem', label: 'Amet lorem' },
    { value: 'ipsum-dolor', label: 'Ipsum dolor' }
  ];

  const chartData = [
    { label: '2017', value: 60 },
    { label: '2018', value: 80 },
    { label: '2019', value: 95, color: 'teal' },
    { label: '2020', value: 70 }
  ];

  const listItems = [
    { icon: Plus, title: 'Lorem Ipsum dolor sit', subtitle: 'Dolor sit' },
    { icon: Minus, title: 'Lorem Ipsum dolor sit', subtitle: 'Dolor sit' },
    { title: 'Lorem Ipsum dolor sit', subtitle: 'Dolor sit' }
  ];

  return (
    <div className={`
      min-h-screen p-6 transition-colors duration-300
      ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}
    `}>
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Section - Inputs and Buttons */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Inputs and Dropdowns */}
          <div className="space-y-4">
            <NeumorphicDropdown
              options={dropdownOptions}
              placeholder="Lorem Ipsum"
              className="w-full"
            />
            
            <NeumorphicInput
              placeholder="Lorem Ipsum"
              variant="elevated"
              className="w-full"
            />
            
            <div className={`
              p-4 rounded-2xl
              ${theme === 'dark'
                ? 'bg-gray-800 shadow-[inset_-4px_-4px_8px_rgba(255,255,255,0.1),inset_4px_4px_8px_rgba(0,0,0,0.8)]'
                : 'bg-gray-100 shadow-[inset_-4px_-4px_8px_rgba(255,255,255,0.8),inset_4px_4px_8px_rgba(0,0,0,0.1)]'
              }
            `}>
              <div className="flex items-center justify-between mb-3">
                <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>Lorem Ipsum</span>
                <ChevronUp className="w-4 h-4 text-gray-500" />
              </div>
              <div className="space-y-2">
                {dropdownOptions.map((option) => (
                  <div
                    key={option.value}
                    className={`
                      px-3 py-2 rounded-xl cursor-pointer transition-all duration-200
                      ${theme === 'dark'
                        ? 'bg-gray-700 shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.1),inset_2px_2px_4px_rgba(0,0,0,0.8)] hover:bg-gray-600'
                        : 'bg-gray-200 shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.8),inset_2px_2px_4px_rgba(0,0,0,0.1)] hover:bg-gray-300'
                      }
                    `}
                  >
                    {option.label}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Middle Column - Buttons and Toggles */}
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <NeumorphicButton variant="icon" icon={<Check className="w-4 h-4" />} />
              <NeumorphicButton variant="icon" icon={<ArrowUp className="w-4 h-4" />} />
              <NeumorphicButton variant="icon" icon={<Menu className="w-4 h-4" />} />
              <NeumorphicButton variant="icon" icon={<Square className="w-4 h-4" />} />
              <NeumorphicButton variant="icon" icon={<ArrowDown className="w-4 h-4" />} />
              <NeumorphicButton variant="icon" icon={<X className="w-4 h-4" />} />
            </div>
            
            <div className="space-y-3">
              <NeumorphicButton variant="primary" active className="w-full">
                LOREM
              </NeumorphicButton>
              <NeumorphicButton variant="secondary" className="w-full">
                LOREM
              </NeumorphicButton>
            </div>
            
            <div className="flex items-center gap-4">
              <div className={`
                w-4 h-4 rounded-full
                bg-gradient-to-r from-teal-400 to-blue-500
                shadow-[inset_2px_2px_4px_rgba(0,0,0,0.2),inset_-2px_-2px_4px_rgba(255,255,255,0.1)]
              `} />
              <div className={`
                w-4 h-4 rounded-full
                ${theme === 'dark'
                  ? 'bg-gray-600 shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.1),inset_2px_2px_4px_rgba(0,0,0,0.8)]'
                  : 'bg-gray-300 shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.8),inset_2px_2px_4px_rgba(0,0,0,0.1)]'
                }
              `} />
            </div>
          </div>

          {/* Right Column - Text Area */}
          <div>
            <NeumorphicInput
              placeholder="Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet."
              variant="pressed"
              className="w-full h-32"
            />
          </div>
        </div>

        {/* Middle Section - Lists, Search, Calendar, Sliders */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Icons and List */}
          <div className="space-y-4">
            <div className="flex gap-3">
              <NeumorphicButton variant="icon" icon={<Plus className="w-4 h-4" />} />
              <NeumorphicButton variant="icon" icon={<Home className="w-4 h-4" />} />
              <NeumorphicButton variant="icon" icon={<Settings className="w-4 h-4" />} />
            </div>
            
            <div className="space-y-3">
              {listItems.map((item, index) => (
                <div
                  key={index}
                  className={`
                    p-4 rounded-2xl
                    ${theme === 'dark'
                      ? 'bg-gray-800 shadow-[inset_-4px_-4px_8px_rgba(255,255,255,0.1),inset_4px_4px_8px_rgba(0,0,0,0.8)]'
                      : 'bg-gray-100 shadow-[inset_-4px_-4px_8px_rgba(255,255,255,0.8),inset_4px_4px_8px_rgba(0,0,0,0.1)]'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    {item.icon && (
                      <div className={`
                        p-2 rounded-xl
                        ${index === 0
                          ? 'bg-gradient-to-r from-teal-400 to-blue-500 text-white'
                          : theme === 'dark'
                            ? 'bg-gray-700 text-gray-300'
                            : 'bg-gray-200 text-gray-600'
                        }
                      `}>
                        <item.icon className="w-4 h-4" />
                      </div>
                    )}
                    <div>
                      <div className={`
                        font-medium text-sm
                        ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
                      `}>
                        {item.title}
                      </div>
                      <div className={`
                        text-xs
                        ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}
                      `}>
                        {item.subtitle}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Middle Column - Search and Calendar */}
          <div className="space-y-4">
            <NeumorphicInput
              placeholder="Search"
              variant="pressed"
              icon={<Search className="w-4 h-4" />}
              className="w-full"
            />
            
            <NeumorphicCalendar
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              className="w-full"
            />
          </div>

          {/* Right Column - Sliders and Segmented Control */}
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
                    className="w-full"
                  />
                </div>
              ))}
            </div>
            
            <div className={`
              p-1 rounded-2xl
              ${theme === 'dark'
                ? 'bg-gray-800 shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.1),inset_2px_2px_4px_rgba(0,0,0,0.8)]'
                : 'bg-gray-100 shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.8),inset_2px_2px_4px_rgba(0,0,0,0.1)]'
              }
            `}>
              <div className="flex">
                <button className={`
                  flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all duration-200
                  bg-gradient-to-r from-teal-400 to-blue-500 text-white
                  shadow-[inset_2px_2px_4px_rgba(0,0,0,0.2),inset_-2px_-2px_4px_rgba(255,255,255,0.1)]
                `}>
                  Ipsum
                </button>
                <button className={`
                  flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all duration-200
                  ${theme === 'dark'
                    ? 'text-gray-300 hover:bg-gray-700'
                    : 'text-gray-600 hover:bg-gray-200'
                  }
                `}>
                  Dolor
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section - Progress, Charts, Navigation */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Navigation and Toggle */}
          <div className="space-y-4">
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((dot) => (
                <div
                  key={dot}
                  className={`
                    w-3 h-3 rounded-full
                    ${dot <= 3
                      ? 'bg-gradient-to-r from-teal-400 to-blue-500'
                      : theme === 'dark'
                        ? 'bg-gray-600'
                        : 'bg-gray-300'
                    }
                  `}
                />
              ))}
            </div>
            
            <div className="flex items-center justify-between">
              <span className={`
                text-sm font-medium
                ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
              `}>
                Toggle
              </span>
              <NeumorphicToggle
                checked={toggleValue}
                onChange={setToggleValue}
              />
            </div>
            
            <div className="flex gap-3">
              <NeumorphicButton variant="icon" icon={<ArrowUp className="w-4 h-4" />} />
              <NeumorphicButton variant="icon" icon={<ArrowDown className="w-4 h-4" />} />
            </div>
          </div>

          {/* Middle Column - Progress Circle and Icons */}
          <div className="space-y-4">
            <div className="flex justify-center">
              <NeumorphicProgress
                value={76}
                size="lg"
                label="Lorem ipsum"
                showPercentage={true}
              />
            </div>
            
            <div className="flex gap-3 justify-center">
              <NeumorphicButton variant="icon" icon={<Search className="w-4 h-4" />} />
              <NeumorphicButton variant="icon" icon={<Shield className="w-4 h-4" />} />
              <NeumorphicButton variant="icon" icon={<BarChart3 className="w-4 h-4" />} />
            </div>
          </div>

          {/* Right Column - Bar Chart */}
          <div>
            <NeumorphicChart
              data={chartData}
              type="bar"
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
