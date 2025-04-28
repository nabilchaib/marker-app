export const actionColors = {
  made: 'bg-[#f64e07] hover:bg-orange-600',   // Orange = Made Shot
  miss: 'bg-red-700 hover:bg-red-600',         // Red = Miss
  assist: 'bg-blue-500 hover:bg-blue-600',     // Blue = Assist
  foul: 'bg-yellow-500 hover:bg-yellow-600',   // Yellow = Foul
  rebound: 'bg-green-500 hover:bg-green-600',  // Green = Rebound
  undo: 'bg-gray-400 hover:bg-gray-500',       // Gray = Undo
};

export const baseButtonStyles = 'text-white font-bold py-2 px-4 rounded-lg shadow-md transition-transform duration-150 transform hover:scale-105 w-full sm:w-auto';

export const buttonStyles = {
  madeShot: `${baseButtonStyles} ${actionColors.made}`,
  missedShot: `${baseButtonStyles} ${actionColors.miss}`,
  assist: `${baseButtonStyles} ${actionColors.assist}`,
  foul: `${baseButtonStyles} ${actionColors.foul}`,
  rebound: `${baseButtonStyles} ${actionColors.rebound}`,
  undo: `${baseButtonStyles} ${actionColors.undo}`,
  stats: 'bg-[#0aa6d6] hover:bg-blue-600 text-white font-bold py-4 px-6 rounded-lg shadow-lg hover:shadow-2xl transition-transform transform hover:scale-105 w-full md:w-auto',
  playerSelect: 'relative w-full sm:w-auto py-2 px-4 md:py-4 md:px-8 text-base md:text-xl font-bold text-white bg-[#0aa6d6] rounded-lg shadow-lg hover:shadow-2xl transition-transform transform hover:scale-105 hover:rotate-2 duration-200 focus:outline-none focus:ring-4 focus:ring-[#0aa6d6]',
  teamSelect: 'py-4 px-8 md:py-5 md:px-10 text-lg md:text-xl font-bold rounded-lg transition-transform duration-200 transform',
}; 