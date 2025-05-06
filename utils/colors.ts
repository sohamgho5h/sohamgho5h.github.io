export const PASTEL_COLORS = [
  '#FFB3BA', // Pastel Pink
  '#BAFFC9', // Pastel Green
  '#BAE1FF', // Pastel Blue
  '#FFFFBA', // Pastel Yellow
  '#FFE4BA', // Pastel Orange
  '#E4BAFF', // Pastel Purple
  '#BAFFE4', // Pastel Mint
  '#FFBAE4', // Pastel Rose
  '#BAE4FF', // Pastel Sky
  '#E4FFBA', // Pastel Lime
];

export const getPastelColorByIndex = (index: number): string => {
  return PASTEL_COLORS[index % PASTEL_COLORS.length];
}; 