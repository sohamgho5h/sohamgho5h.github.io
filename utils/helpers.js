// Generate a random pastel color
export const getRandomPastelColor = () => {
  const hue = Math.floor(Math.random() * 360);
  return `hsl(${hue}, 70%, 85%)`;
};

// Calculate modal dimensions
export const calculateModalDimensions = (window) => {
  const maxWidth = Math.min(600, window.innerWidth - 40);
  const maxHeight = window.innerHeight - 40;
  const targetWidth = maxWidth;
  const targetLeft = (window.innerWidth - targetWidth) / 2;
  const targetTop = 20;

  return {
    width: targetWidth,
    maxHeight: maxHeight,
    left: targetLeft,
    top: targetTop
  };
}; 