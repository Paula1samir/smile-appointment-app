import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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
    if (isSelected) bgColor = 'bg-blue-200';
    if (isHovered) bgColor = 'bg-gray-200';

    return `${bgColor} border-2 border-gray-300 rounded w-8 h-8 flex items-center justify-center text-xs font-bold cursor-pointer hover:border-blue-400 transition-colors`;
  };

  const ToothButton = ({ toothNumber }) => (
    <button
      className={getToothStyle(toothNumber)}
      onClick={() => onToothSelect(toothNumber.toString())}
      onMouseEnter={() => setHoveredTooth(toothNumber)}
      onMouseLeave={() => setHoveredTooth(null)}
      title={`Tooth ${toothNumber}${surgeryLogs.some(log => log.tooth_number === toothNumber.toString()) ? ' (Has history)' : ''}`}
    >
      {toothNumber}
    </button>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">
          {isChild ? 'Child' : 'Adult'} Tooth Diagram
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Upper Jaw */}
          <div className="text-center">
            <div className="text-sm font-medium mb-2">Upper Jaw</div>
            <div className="flex justify-center space-x-1">
              {/* Upper Right */}
              <div className="flex space-x-1">
                {teeth.upper.right.map(tooth => (
                  <ToothButton key={tooth} toothNumber={tooth} />
                ))}
              </div>
              <div className="w-4"></div> {/* Gap for midline */}
              {/* Upper Left */}
              <div className="flex space-x-1">
                {teeth.upper.left.map(tooth => (
                  <ToothButton key={tooth} toothNumber={tooth} />
                ))}
              </div>
            </div>
          </div>

          {/* Lower Jaw */}
          <div className="text-center">
            <div className="text-sm font-medium mb-2">Lower Jaw</div>
            <div className="flex justify-center space-x-1">
              {/* Lower Left */}
              <div className="flex space-x-1">
                {teeth.lower.left.map(tooth => (
                  <ToothButton key={tooth} toothNumber={tooth} />
                ))}
              </div>
              <div className="w-4"></div> {/* Gap for midline */}
              {/* Lower Right */}
              <div className="flex space-x-1">
                {teeth.lower.right.map(tooth => (
                  <ToothButton key={tooth} toothNumber={tooth} />
                ))}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex justify-center space-x-4 text-xs">
            <div className="flex items-center space-x-1">
              <div className="w-4 h-4 bg-white border-2 border-gray-300 rounded"></div>
              <span>Normal</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-4 h-4 bg-yellow-200 border-2 border-gray-300 rounded"></div>
              <span>Has History</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-4 h-4 bg-blue-200 border-2 border-gray-300 rounded"></div>
              <span>Selected</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ToothDiagram;