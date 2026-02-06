
import React from 'react';

export const BearHead: React.FC<{ direction: string, heartEyes?: boolean }> = ({ direction, heartEyes }) => {
  const rotation = {
    UP: 'rotate-0',
    DOWN: 'rotate-180',
    LEFT: '-rotate-90',
    RIGHT: 'rotate-90',
  }[direction] || 'rotate-0';

  return (
    <div className={`relative w-full h-full flex items-center justify-center transition-transform duration-150 ${rotation}`}>
      <div className="w-4/5 h-4/5 bg-[#8d6e63] rounded-full relative shadow-sm">
        <div className="absolute -top-1 -left-1 w-2/5 h-2/5 bg-[#8d6e63] rounded-full border-2 border-[#795548]" />
        <div className="absolute -top-1 -right-1 w-2/5 h-2/5 bg-[#8d6e63] rounded-full border-2 border-[#795548]" />
        
        {heartEyes ? (
          <>
            <div className="absolute top-1/4 left-1/4 text-[8px]">❤️</div>
            <div className="absolute top-1/4 right-1/4 text-[8px]">❤️</div>
          </>
        ) : (
          <>
            <div className="absolute top-1/4 left-1/4 w-1.5 h-1.5 bg-black rounded-full" />
            <div className="absolute top-1/4 right-1/4 w-1.5 h-1.5 bg-black rounded-full" />
          </>
        )}
        
        <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-1/3 h-1/4 bg-[#d7ccc8] rounded-full flex items-center justify-center">
            <div className="w-1.5 h-1 bg-black rounded-full mb-0.5" />
        </div>
        <div className="absolute top-1/2 left-1 w-2 h-1 bg-purple-300 rounded-full opacity-60" />
        <div className="absolute top-1/2 right-1 w-2 h-1 bg-purple-300 rounded-full opacity-60" />
      </div>
    </div>
  );
};

export const BearBody: React.FC = () => (
  <div className="w-full h-full flex items-center justify-center p-0.5">
    <div className="w-full h-full bg-[#a1887f] rounded-lg shadow-sm" />
  </div>
);

export const MatchaItem: React.FC = () => (
  <div className="w-full h-full flex items-center justify-center animate-bounce">
    <div className="relative w-4/5 h-3/5 bg-[#9BB068] rounded-b-full border-2 border-[#7D8C55] flex flex-col items-center justify-center">
      <div className="absolute -top-1 w-full h-1 bg-[#F1F8E9] rounded-full opacity-50" />
      <div className="w-1 h-3 bg-[#D7CCC8] rounded-full mt-1" />
    </div>
  </div>
);

export const ToiletItem: React.FC = () => (
  <div className="w-full h-full flex items-center justify-center animate-pulse">
    <div className="relative w-3/4 h-3/4 bg-white border-2 border-gray-300 rounded-lg flex flex-col items-center justify-end overflow-hidden">
      <div className="absolute top-0 w-full h-1/3 bg-gray-100 border-b border-gray-300" />
      <div className="w-4/5 h-1/2 bg-white border-2 border-gray-200 rounded-full mb-1" />
      <div className="absolute bottom-1 w-1/2 h-1 bg-blue-200 rounded-full" />
    </div>
  </div>
);

export const BedItem: React.FC = () => (
  <div className="w-full h-full flex items-center justify-center">
    <div className="relative w-4/5 h-3/5 bg-blue-400 rounded-sm border-2 border-blue-600">
      <div className="absolute left-0 top-0 w-1/3 h-full bg-white border-r border-blue-600" />
      <div className="absolute right-1 top-1 w-2 h-2 rounded-full bg-blue-200 opacity-50" />
    </div>
  </div>
);

export const ManItem: React.FC = () => (
  <div className="w-full h-full flex items-center justify-center text-xl select-none">
    👱‍♂️
  </div>
);
