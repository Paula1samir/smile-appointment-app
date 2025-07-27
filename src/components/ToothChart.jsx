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
        { number: '1', name: 'Upper Right Third Molar' },
        { number: '2', name: 'Upper Right Second Molar' },
        { number: '3', name: 'Upper Right First Molar' },
        { number: '4', name: 'Upper Right Second Premolar' },
        { number: '5', name: 'Upper Right First Premolar' },
        { number: '6', name: 'Upper Right Canine' },
        { number: '7', name: 'Upper Right Lateral Incisor' },
        { number: '8', name: 'Upper Right Central Incisor' }
      ],
      left: [
        { number: '9', name: 'Upper Left Central Incisor' },
        { number: '10', name: 'Upper Left Lateral Incisor' },
        { number: '11', name: 'Upper Left Canine' },
        { number: '12', name: 'Upper Left First Premolar' },
        { number: '13', name: 'Upper Left Second Premolar' },
        { number: '14', name: 'Upper Left First Molar' },
        { number: '15', name: 'Upper Left Second Molar' },
        { number: '16', name: 'Upper Left Third Molar' }
      ]
    },
    lower: {
      left: [
        { number: '17', name: 'Lower Left Third Molar' },
        { number: '18', name: 'Lower Left Second Molar' },
        { number: '19', name: 'Lower Left First Molar' },
        { number: '20', name: 'Lower Left Second Premolar' },
        { number: '21', name: 'Lower Left First Premolar' },
        { number: '22', name: 'Lower Left Canine' },
        { number: '23', name: 'Lower Left Lateral Incisor' },
        { number: '24', name: 'Lower Left Central Incisor' }
      ],
      right: [
        { number: '25', name: 'Lower Right Central Incisor' },
        { number: '26', name: 'Lower Right Lateral Incisor' },
        { number: '27', name: 'Lower Right Canine' },
        { number: '28', name: 'Lower Right First Premolar' },
        { number: '29', name: 'Lower Right Second Premolar' },
        { number: '30', name: 'Lower Right First Molar' },
        { number: '31', name: 'Lower Right Second Molar' },
        { number: '32', name: 'Lower Right Third Molar' }
      ]
    }
  };

  // Child teeth definitions with names
  const childTeeth = {
    upper: {
      right: [
        { number: 'A', name: 'Upper Right Second Molar' },
        { number: 'B', name: 'Upper Right First Molar' },
        { number: 'C', name: 'Upper Right Canine' },
        { number: 'D', name: 'Upper Right Lateral Incisor' },
        { number: 'E', name: 'Upper Right Central Incisor' }
      ],
      left: [
        { number: 'F', name: 'Upper Left Central Incisor' },
        { number: 'G', name: 'Upper Left Lateral Incisor' },
        { number: 'H', name: 'Upper Left Canine' },
        { number: 'I', name: 'Upper Left First Molar' },
        { number: 'J', name: 'Upper Left Second Molar' }
      ]
    },
    lower: {
      left: [
        { number: 'K', name: 'Lower Left Second Molar' },
        { number: 'L', name: 'Lower Left First Molar' },
        { number: 'M', name: 'Lower Left Canine' },
        { number: 'N', name: 'Lower Left Lateral Incisor' },
        { number: 'O', name: 'Lower Left Central Incisor' }
      ],
      right: [
        { number: 'P', name: 'Lower Right Central Incisor' },
        { number: 'Q', name: 'Lower Right Lateral Incisor' },
        { number: 'R', name: 'Lower Right Canine' },
        { number: 'S', name: 'Lower Right First Molar' },
        { number: 'T', name: 'Lower Right Second Molar' }
      ]
    }
  };

  const teeth = isChild ? childTeeth : adultTeeth;

  const getToothTreatments = (toothNumber) => {
    return surgeryLogs.filter(log => log.tooth_number === toothNumber);
  };

  const getToothStyle = (tooth) => {
    const treatments = getToothTreatments(tooth.number);
    const hasHistory = treatments.length > 0;
    const isSelected = selectedTooth === tooth.number;
    const isHovered = hoveredTooth === tooth.number;

    let bgColor = 'bg-white';
    let borderColor = 'border-gray-300';
    
    if (showHistory && hasHistory) {
      bgColor = 'bg-red-200';
      borderColor = 'border-red-400';
    } else if (hasHistory) {
      bgColor = 'bg-yellow-200';
      borderColor = 'border-yellow-400';
    }
    
    if (isSelected) {
      bgColor = 'bg-primary-200';
      borderColor = 'border-primary';
    }
    
    if (isHovered) {
      borderColor = 'border-primary-600';
    }

    return `${bgColor} ${borderColor} border-2 rounded-lg w-12 h-12 flex flex-col items-center justify-center text-xs font-bold cursor-pointer hover:shadow-md transition-all duration-200`;
  };

  const ToothIcon = ({ tooth }) => {
    const treatments = getToothTreatments(tooth.number);
    
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className={getToothStyle(tooth)}
              onClick={() => onToothSelect && onToothSelect(tooth.number)}
              onMouseEnter={() => setHoveredTooth(tooth.number)}
              onMouseLeave={() => setHoveredTooth(null)}
            >
              <div className="text-sm font-bold">{tooth.number}</div>
              <div className="text-[8px] leading-none text-center">
                {tooth.name.split(' ').slice(-1)[0]}
              </div>
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <div className="p-2">
              <p className="font-medium">{tooth.name}</p>
              <p className="text-xs text-muted-foreground">Tooth {tooth.number}</p>
              {treatments.length > 0 ? (
                <div className="mt-2 space-y-1">
                  <p className="text-xs font-medium">Recent treatments:</p>
                  {treatments.slice(0, 3).map((treatment, index) => (
                    <div key={index} className="text-xs border-l-2 border-red-500 pl-2">
                      <p className="font-medium">{treatment.treatment_performed}</p>
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
                <p className="text-xs text-muted-foreground mt-1">No previous treatments</p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{isChild ? 'Child' : 'Adult'} Tooth Chart</span>
          <Badge variant="outline">
            {showHistory ? 'Treatment History View' : 'Selection Mode'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {/* Upper Jaw */}
          <div className="text-center">
            <h3 className="text-sm font-medium mb-4 text-muted-foreground">Upper Jaw</h3>
            <div className="flex justify-center space-x-6">
              {/* Upper Right */}
              <div className="flex space-x-2">
                {teeth.upper.right.map(tooth => (
                  <ToothIcon key={tooth.number} tooth={tooth} />
                ))}
              </div>
              {/* Center line */}
              <div className="w-px bg-gray-300 h-12"></div>
              {/* Upper Left */}
              <div className="flex space-x-2">
                {teeth.upper.left.map(tooth => (
                  <ToothIcon key={tooth.number} tooth={tooth} />
                ))}
              </div>
            </div>
          </div>

          {/* Lower Jaw */}
          <div className="text-center">
            <h3 className="text-sm font-medium mb-4 text-muted-foreground">Lower Jaw</h3>
            <div className="flex justify-center space-x-6">
              {/* Lower Left */}
              <div className="flex space-x-2">
                {teeth.lower.left.map(tooth => (
                  <ToothIcon key={tooth.number} tooth={tooth} />
                ))}
              </div>
              {/* Center line */}
              <div className="w-px bg-gray-300 h-12"></div>
              {/* Lower Right */}
              <div className="flex space-x-2">
                {teeth.lower.right.map(tooth => (
                  <ToothIcon key={tooth.number} tooth={tooth} />
                ))}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex justify-center space-x-6 text-sm pt-4 border-t">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-white border-2 border-gray-300 rounded"></div>
              <span>No Treatment</span>
            </div>
            {!showHistory && (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-yellow-200 border-2 border-yellow-400 rounded"></div>
                <span>Has Treatment History</span>
              </div>
            )}
            {showHistory && (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-200 border-2 border-red-400 rounded"></div>
                <span>Previous Treatment</span>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-primary-200 border-2 border-primary rounded"></div>
              <span>Selected</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ToothChart;