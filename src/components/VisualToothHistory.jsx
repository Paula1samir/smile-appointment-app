import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import adultTeethImage from '@/assets/adult-teeth-diagram.png';
import childTeethImage from '@/assets/child-teeth-diagram.png';

const VisualToothHistory = ({ patientAge, surgeryLogs }) => {
  const [selectedTooth, setSelectedTooth] = useState(null);
  const isChild = patientAge < 12;

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
  const allTeeth = [
    ...teeth.upper.right,
    ...teeth.upper.left,
    ...teeth.lower.left,
    ...teeth.lower.right
  ];

  const getToothTreatments = (toothNumber) => {
    return surgeryLogs.filter(log => log.tooth_number === toothNumber.toString());
  };

  const hasHistory = (toothNumber) => {
    return getToothTreatments(toothNumber).length > 0;
  };

  const getToothStyle = (toothNumber) => {
    const treatments = getToothTreatments(toothNumber);
    const isSelected = selectedTooth === toothNumber;
    
    let bgColor = 'bg-white';
    if (treatments.length > 0) bgColor = 'bg-red-200';
    if (isSelected) bgColor = 'bg-primary-200';

    return `${bgColor} border-2 border-gray-300 rounded w-8 h-8 flex items-center justify-center text-xs font-bold cursor-pointer hover:border-primary transition-colors absolute`;
  };

  const ToothButton = ({ toothNumber, style }) => {
    const treatments = getToothTreatments(toothNumber);
    
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className={getToothStyle(toothNumber)}
              style={style}
              onClick={() => setSelectedTooth(toothNumber)}
            >
              {toothNumber}
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <div className="p-2">
              <p className="font-medium">Tooth {toothNumber}</p>
              {treatments.length > 0 ? (
                <div className="mt-2 space-y-1">
                  {treatments.map((treatment, index) => (
                    <div key={index} className="text-xs">
                      <p>{new Date(treatment.date).toLocaleDateString()}</p>
                      <p>{treatment.treatment_performed}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No treatments</p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  // Positioning for teeth (these would need to be adjusted based on actual image)
  const getToothPosition = (toothNumber) => {
    // This is a simplified positioning system - you'd need to adjust these based on your actual tooth diagram image
    const index = allTeeth.indexOf(toothNumber);
    const row = Math.floor(index / 8);
    const col = index % 8;
    
    return {
      top: `${20 + (row * 40)}%`,
      left: `${10 + (col * 10)}%`
    };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Visual Treatment History</span>
          <Badge variant="outline">
            {isChild ? 'Child Chart' : 'Adult Chart'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Tooth Diagram with Overlays */}
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

          {/* Selected Tooth Details */}
          {selectedTooth && (
            <Card>
              <CardHeader>
                <CardTitle>Tooth {selectedTooth} - Treatment Details</CardTitle>
              </CardHeader>
              <CardContent>
                {getToothTreatments(selectedTooth).length > 0 ? (
                  <div className="space-y-3">
                    {getToothTreatments(selectedTooth).map((treatment, index) => (
                      <div key={index} className="border-l-4 border-red-500 pl-4">
                        <p className="font-medium">{treatment.treatment_performed}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(treatment.date).toLocaleDateString()}
                        </p>
                        {treatment.notes && (
                          <p className="text-sm">{treatment.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No treatments recorded for this tooth</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Legend */}
          <div className="flex justify-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-white border-2 border-gray-300 rounded"></div>
              <span>No Treatment</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-200 border-2 border-gray-300 rounded"></div>
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

export default VisualToothHistory;