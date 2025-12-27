import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

const ToothChart = ({ isChild = false, onToothSelect, selectedTooth, surgeryLogs = [], showHistory = false }) => {
  const [hoveredTooth, setHoveredTooth] = useState(null);

  // Adult teeth definitions with names
  const adultTeeth = {
    upper: {
      right: [
        { number: '1', name: 'Upper Right Third Molar', type: 'molar' },
        { number: '2', name: 'Upper Right Second Molar', type: 'molar' },
        { number: '3', name: 'Upper Right First Molar', type: 'molar' },
        { number: '4', name: 'Upper Right Second Premolar', type: 'premolar' },
        { number: '5', name: 'Upper Right First Premolar', type: 'premolar' },
        { number: '6', name: 'Upper Right Canine', type: 'canine' },
        { number: '7', name: 'Upper Right Lateral Incisor', type: 'incisor' },
        { number: '8', name: 'Upper Right Central Incisor', type: 'incisor' }
      ],
      left: [
        { number: '9', name: 'Upper Left Central Incisor', type: 'incisor' },
        { number: '10', name: 'Upper Left Lateral Incisor', type: 'incisor' },
        { number: '11', name: 'Upper Left Canine', type: 'canine' },
        { number: '12', name: 'Upper Left First Premolar', type: 'premolar' },
        { number: '13', name: 'Upper Left Second Premolar', type: 'premolar' },
        { number: '14', name: 'Upper Left First Molar', type: 'molar' },
        { number: '15', name: 'Upper Left Second Molar', type: 'molar' },
        { number: '16', name: 'Upper Left Third Molar', type: 'molar' }
      ]
    },
    lower: {
      left: [
        { number: '17', name: 'Lower Left Third Molar', type: 'molar' },
        { number: '18', name: 'Lower Left Second Molar', type: 'molar' },
        { number: '19', name: 'Lower Left First Molar', type: 'molar' },
        { number: '20', name: 'Lower Left Second Premolar', type: 'premolar' },
        { number: '21', name: 'Lower Left First Premolar', type: 'premolar' },
        { number: '22', name: 'Lower Left Canine', type: 'canine' },
        { number: '23', name: 'Lower Left Lateral Incisor', type: 'incisor' },
        { number: '24', name: 'Lower Left Central Incisor', type: 'incisor' }
      ],
      right: [
        { number: '25', name: 'Lower Right Central Incisor', type: 'incisor' },
        { number: '26', name: 'Lower Right Lateral Incisor', type: 'incisor' },
        { number: '27', name: 'Lower Right Canine', type: 'canine' },
        { number: '28', name: 'Lower Right First Premolar', type: 'premolar' },
        { number: '29', name: 'Lower Right Second Premolar', type: 'premolar' },
        { number: '30', name: 'Lower Right First Molar', type: 'molar' },
        { number: '31', name: 'Lower Right Second Molar', type: 'molar' },
        { number: '32', name: 'Lower Right Third Molar', type: 'molar' }
      ]
    }
  };

  // Child teeth definitions with names
  const childTeeth = {
    upper: {
      right: [
        { number: 'A', name: 'Upper Right Second Molar', type: 'molar' },
        { number: 'B', name: 'Upper Right First Molar', type: 'molar' },
        { number: 'C', name: 'Upper Right Canine', type: 'canine' },
        { number: 'D', name: 'Upper Right Lateral Incisor', type: 'incisor' },
        { number: 'E', name: 'Upper Right Central Incisor', type: 'incisor' }
      ],
      left: [
        { number: 'F', name: 'Upper Left Central Incisor', type: 'incisor' },
        { number: 'G', name: 'Upper Left Lateral Incisor', type: 'incisor' },
        { number: 'H', name: 'Upper Left Canine', type: 'canine' },
        { number: 'I', name: 'Upper Left First Molar', type: 'molar' },
        { number: 'J', name: 'Upper Left Second Molar', type: 'molar' }
      ]
    },
    lower: {
      left: [
        { number: 'K', name: 'Lower Left Second Molar', type: 'molar' },
        { number: 'L', name: 'Lower Left First Molar', type: 'molar' },
        { number: 'M', name: 'Lower Left Canine', type: 'canine' },
        { number: 'N', name: 'Lower Left Lateral Incisor', type: 'incisor' },
        { number: 'O', name: 'Lower Left Central Incisor', type: 'incisor' }
      ],
      right: [
        { number: 'P', name: 'Lower Right Central Incisor', type: 'incisor' },
        { number: 'Q', name: 'Lower Right Lateral Incisor', type: 'incisor' },
        { number: 'R', name: 'Lower Right Canine', type: 'canine' },
        { number: 'S', name: 'Lower Right First Molar', type: 'molar' },
        { number: 'T', name: 'Lower Right Second Molar', type: 'molar' }
      ]
    }
  };

  const teeth = isChild ? childTeeth : adultTeeth;

  const getToothTreatments = (toothNumber) => {
    return surgeryLogs.filter(log => log.tooth_number === toothNumber);
  };

  const getToothColors = (tooth) => {
    const treatments = getToothTreatments(tooth.number);
    const hasHistory = treatments.length > 0;
    const isSelected = selectedTooth === tooth.number;
    const isHovered = hoveredTooth === tooth.number;

    let fillColor = '#F5F5F0'; // Ivory/cream color for healthy tooth
    let strokeColor = '#D4D4C8';
    let glowColor = 'rgba(59, 130, 246, 0)';

    if (showHistory && hasHistory) {
      fillColor = '#FCA5A5'; // Red for problematic teeth
      strokeColor = '#DC2626';
    } else if (hasHistory) {
      fillColor = '#FDE68A'; // Yellow for teeth with history
      strokeColor = '#F59E0B';
    }

    if (isSelected) {
      fillColor = '#BFDBFE';
      strokeColor = '#3B82F6';
      glowColor = 'rgba(59, 130, 246, 0.3)';
    }

    if (isHovered) {
      strokeColor = '#2563EB';
      glowColor = 'rgba(59, 130, 246, 0.2)';
    }

    return { fillColor, strokeColor, glowColor };
  };

  // SVG tooth shapes for different tooth types
  const ToothSVG = ({ tooth, position }) => {
    const { fillColor, strokeColor, glowColor } = getToothColors(tooth);
    const isUpper = position === 'upper';

    // Different shapes for different tooth types
    const getToothPath = () => {
      switch (tooth.type) {
        case 'molar':
          return isUpper
            ? "M5,15 Q5,5 15,5 Q25,5 35,5 Q45,5 45,15 L45,35 Q45,45 35,50 Q25,52 15,50 Q5,45 5,35 Z M15,10 Q15,15 20,15 Q25,15 25,10 M30,10 Q30,15 35,15 Q40,15 40,10"
            : "M5,5 Q5,0 15,0 Q25,0 35,0 Q45,0 45,5 L45,30 Q45,40 35,45 Q25,47 15,45 Q5,40 5,30 Z M15,5 Q15,10 20,10 Q25,10 25,5 M30,5 Q30,10 35,10 Q40,10 40,5";
        case 'premolar':
          return isUpper
            ? "M8,15 Q8,5 18,5 Q28,5 38,5 Q48,5 48,15 L48,35 Q48,45 38,48 Q28,50 18,48 Q8,45 8,35 Z M20,10 Q20,15 28,15 Q36,15 36,10"
            : "M8,5 Q8,0 18,0 Q28,0 38,0 Q48,0 48,5 L48,30 Q48,40 38,43 Q28,45 18,43 Q8,40 8,30 Z M20,5 Q20,10 28,10 Q36,10 36,5";
        case 'canine':
          return isUpper
            ? "M12,18 Q12,5 20,3 Q28,5 36,5 Q44,5 44,18 L44,35 Q44,45 36,48 Q28,50 20,48 Q12,45 12,35 Z M28,8 L28,15"
            : "M12,5 Q12,0 20,0 Q28,0 36,0 Q44,0 44,5 L44,32 Q44,42 36,45 Q28,47 20,45 Q12,42 12,32 Z M28,3 L28,10";
        case 'incisor':
        default:
          return isUpper
            ? "M15,20 Q15,5 22,3 Q28,3 35,3 Q42,5 42,20 L42,38 Q42,48 35,50 Q28,52 22,50 Q15,48 15,38 Z"
            : "M15,5 Q15,0 22,0 Q28,0 35,0 Q42,0 42,5 L42,35 Q42,45 35,47 Q28,49 22,47 Q15,45 15,35 Z";
      }
    };

    return (
      <svg
        viewBox="0 0 56 56"
        className="w-full h-full"
        style={{ filter: `drop-shadow(0 2px 4px ${glowColor})` }}
      >
        <defs>
          <linearGradient id={`toothGradient-${tooth.number}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={fillColor} stopOpacity="1" />
            <stop offset="100%" stopColor={fillColor} stopOpacity="0.85" />
          </linearGradient>
          <filter id={`toothShadow-${tooth.number}`}>
            <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
            <feOffset dx="0" dy="2" result="offsetblur" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.3" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path
          d={getToothPath()}
          fill={`url(#toothGradient-${tooth.number})`}
          stroke={strokeColor}
          strokeWidth="2"
          filter={`url(#toothShadow-${tooth.number})`}
        />
        <text
          x="28"
          y="30"
          textAnchor="middle"
          className="text-[10px] font-bold fill-gray-700 dark:fill-gray-800"
          style={{ userSelect: 'none' }}
        >
          {tooth.number}
        </text>
      </svg>
    );
  };

  const ToothIcon = ({ tooth, position }) => {
    const treatments = getToothTreatments(tooth.number);

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className="relative cursor-pointer hover:scale-110 transition-transform duration-200"
              style={{
                width: tooth.type === 'molar' ? '56px' : tooth.type === 'premolar' ? '52px' : tooth.type === 'canine' ? '48px' : '44px',
                height: position === 'upper' ? '60px' : '56px'
              }}
              onClick={() => onToothSelect && onToothSelect(tooth.number)}
              onMouseEnter={() => setHoveredTooth(tooth.number)}
              onMouseLeave={() => setHoveredTooth(null)}
            >
              <ToothSVG tooth={tooth} position={position} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <div className="p-2">
              <p className="font-medium">{tooth.name}</p>
              <p className="text-xs text-muted-foreground">Tooth {tooth.number}</p>
              {treatments.length > 0 ? (
                <div className="mt-2 space-y-1">
                  <p className="text-xs font-medium text-red-600">Problems/Treatments:</p>
                  {treatments.slice(0, 3).map((treatment, index) => (
                    <div key={index} className="text-xs border-l-2 border-red-500 pl-2 bg-red-50 dark:bg-red-950 py-1">
                      <p className="font-medium text-red-700 dark:text-red-400">{treatment.treatment_performed}</p>
                      <p className="text-muted-foreground">{new Date(treatment.date).toLocaleDateString()}</p>
                    </div>
                  ))}
                  {treatments.length > 3 && (
                    <p className="text-xs text-muted-foreground">
                      +{treatments.length - 3} more treatments
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">✓ Healthy - No problems</p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span className="text-2xl">🦷</span>
            {isChild ? 'Child' : 'Adult'} Dental Chart
          </span>
          <Badge variant="outline" className="bg-white dark:bg-gray-800">
            {showHistory ? 'Problem View' : 'Selection Mode'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-8 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="space-y-12">
          {/* Upper Jaw */}
          <div className="relative">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-6">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700">
                UPPER JAW
              </span>
            </div>
            <div className="bg-gradient-to-b from-pink-100 to-pink-50 dark:from-pink-950 dark:to-pink-900 rounded-3xl p-6 shadow-inner border-2 border-pink-200 dark:border-pink-800">
              <div className="flex justify-center items-end gap-1">
                {/* Upper Right */}
                <div className="flex items-end gap-1">
                  {teeth.upper.right.map(tooth => (
                    <ToothIcon key={tooth.number} tooth={tooth} position="upper" />
                  ))}
                </div>
                {/* Center line */}
                <div className="w-0.5 h-16 bg-gradient-to-b from-red-400 to-pink-300 mx-2 rounded-full"></div>
                {/* Upper Left */}
                <div className="flex items-end gap-1">
                  {teeth.upper.left.map(tooth => (
                    <ToothIcon key={tooth.number} tooth={tooth} position="upper" />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Jaw Separator */}
          <div className="relative h-8 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-dashed border-gray-300 dark:border-gray-700"></div>
            </div>
            <div className="relative bg-white dark:bg-gray-900 px-4">
              <span className="text-xs font-semibold text-gray-400">BITE LINE</span>
            </div>
          </div>

          {/* Lower Jaw */}
          <div className="relative">
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-6">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700">
                LOWER JAW
              </span>
            </div>
            <div className="bg-gradient-to-t from-pink-100 to-pink-50 dark:from-pink-950 dark:to-pink-900 rounded-3xl p-6 shadow-inner border-2 border-pink-200 dark:border-pink-800">
              <div className="flex justify-center items-start gap-1">
                {/* Lower Left */}
                <div className="flex items-start gap-1">
                  {teeth.lower.left.map(tooth => (
                    <ToothIcon key={tooth.number} tooth={tooth} position="lower" />
                  ))}
                </div>
                {/* Center line */}
                <div className="w-0.5 h-16 bg-gradient-to-t from-red-400 to-pink-300 mx-2 rounded-full"></div>
                {/* Lower Right */}
                <div className="flex items-start gap-1">
                  {teeth.lower.right.map(tooth => (
                    <ToothIcon key={tooth.number} tooth={tooth} position="lower" />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-4 pt-6 border-t-2 border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="w-6 h-6 rounded" style={{ background: '#F5F5F0', border: '2px solid #D4D4C8' }}></div>
              <span className="text-sm font-medium">Healthy</span>
            </div>
            {!showHistory && (
              <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="w-6 h-6 bg-yellow-200 border-2 border-yellow-400 rounded"></div>
                <span className="text-sm font-medium">Has History</span>
              </div>
            )}
            {showHistory && (
              <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-2 rounded-lg border border-red-300 dark:border-red-700 shadow-sm">
                <div className="w-6 h-6 bg-red-300 border-2 border-red-500 rounded"></div>
                <span className="text-sm font-medium text-red-600 dark:text-red-400">Problem/Treatment</span>
              </div>
            )}
            <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-2 rounded-lg border border-blue-300 dark:border-blue-700 shadow-sm">
              <div className="w-6 h-6 bg-blue-200 border-2 border-blue-500 rounded"></div>
              <span className="text-sm font-medium">Selected</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ToothChart;