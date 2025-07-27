import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import adultTeethImage from '@/assets/adult-teeth-diagram.png';
import childTeethImage from '@/assets/child-teeth-diagram.png';

const ToothDiagram = ({ isChild = false, onToothSelect, selectedTooth, surgeryLogs = [] }) => {
  const [hoveredTooth, setHoveredTooth] = useState(null);

  // Adult teeth numbering (1-32)
  const adultTeeth = {
    upper: {
      right: [1, 2, 3, 4, 5, 6, 7, 8],
      left: [9, 10, 11, 12, 13, 14, 15, 16]
    },
    lower: {
      left: [17, 18, 19, 20, 21, 22, 23, 24],
      right: [25, 26, 27, 28, 29, 30, 31, 32]
    }
  };

  // Child teeth numbering (A-T)
  const childTeeth = {
    upper: {
      right: ['A', 'B', 'C', 'D', 'E'],
      left: ['F', 'G', 'H', 'I', 'J']
    },
    lower: {
      left: ['K', 'L', 'M', 'N', 'O'],
      right: ['P', 'Q', 'R', 'S', 'T']
    }
  };

  const teeth = isChild ? childTeeth : adultTeeth;

  const getToothStyle = (toothNumber) => {
    const hasHistory = surgeryLogs.some(log => log.tooth_number === toothNumber.toString());
    const isSelected = selectedTooth === toothNumber.toString();
    const isHovered = hoveredTooth === toothNumber;

    let bgColor = 'bg-white';
    if (hasHistory) bgColor = 'bg-yellow-200';
    if (isSelected) bgColor = 'bg-primary-200';
    if (isHovered) bgColor = 'bg-gray-200';

    return `${bgColor} border-2 border-gray-300 rounded w-8 h-8 flex items-center justify-center text-xs font-bold cursor-pointer hover:border-primary transition-colors`;
  };

  const ToothButton = ({ toothNumber }) => {
    const hasToothHistory = surgeryLogs.some(log => log.tooth_number === toothNumber.toString());
    const toothTreatments = surgeryLogs.filter(log => log.tooth_number === toothNumber.toString());
    
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className={getToothStyle(toothNumber)}
              onClick={() => onToothSelect(toothNumber.toString())}
              onMouseEnter={() => setHoveredTooth(toothNumber)}
              onMouseLeave={() => setHoveredTooth(null)}
            >
              {toothNumber}
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <div className="p-2">
              <p className="font-medium">Tooth {toothNumber}</p>
              {hasToothHistory ? (
                <div className="mt-2 space-y-1">
                  <p className="text-xs font-medium">Recent treatments:</p>
                  {toothTreatments.slice(0, 3).map((treatment, index) => (
                    <div key={index} className="text-xs">
                      <p>{new Date(treatment.date).toLocaleDateString()}</p>
                      <p>{treatment.treatment_performed}</p>
                    </div>
                  ))}
                  {toothTreatments.length > 3 && (
                    <p className="text-xs text-muted-foreground">
                      +{toothTreatments.length - 3} more treatments
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
        <CardTitle className="text-center">
          {isChild ? 'Child' : 'Adult'} Tooth Diagram
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Visual Tooth Diagram */}
          <div className="relative bg-gray-50 rounded-lg p-4">
            <img 
              src={isChild ? childTeethImage : adultTeethImage} 
              alt={`${isChild ? 'Child' : 'Adult'} teeth diagram`}
              className="w-full h-auto max-w-2xl mx-auto"
            />
            
            {/* Overlay tooth buttons - simplified grid layout */}
            <div className="absolute inset-0 flex flex-col justify-center items-center">
              {/* Upper Jaw */}
              <div className="mb-8">
                <div className="flex space-x-1 mb-2">
                  {teeth.upper.right.map(tooth => (
                    <ToothButton key={tooth} toothNumber={tooth} />
                  ))}
                  <div className="w-4"></div>
                  {teeth.upper.left.map(tooth => (
                    <ToothButton key={tooth} toothNumber={tooth} />
                  ))}
                </div>
              </div>
              
              {/* Lower Jaw */}
              <div>
                <div className="flex space-x-1">
                  {teeth.lower.left.map(tooth => (
                    <ToothButton key={tooth} toothNumber={tooth} />
                  ))}
                  <div className="w-4"></div>
                  {teeth.lower.right.map(tooth => (
                    <ToothButton key={tooth} toothNumber={tooth} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex justify-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-white border-2 border-gray-300 rounded"></div>
              <span>No Treatment</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-yellow-200 border-2 border-gray-300 rounded"></div>
              <span>Has Treatment History</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-primary-200 border-2 border-gray-300 rounded"></div>
              <span>Selected</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ToothDiagram;