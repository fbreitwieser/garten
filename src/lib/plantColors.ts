const PALETTE = [
  '#FFB3B3', '#FFD9B3', '#FFFAB3', '#B3FFB3',
  '#B3FFFF', '#B3D9FF', '#D9B3FF', '#FFB3FF',
  '#B3FFD9', '#FFB3D9', '#E8E8B3', '#C8E8C8',
];

export function getColor(plantId: string, allPlantIds: string[]): string {
  if (!plantId) return 'transparent';
  const idx = allPlantIds.indexOf(plantId);
  if (idx === -1) return '#e0e0e0';
  return PALETTE[idx % PALETTE.length];
}

export const plantEmoji: Record<string, string> = {
  tomato: '🍅',
  basil: '🌿',
  carrot: '🥕',
  fennel: '🌾',
  leek: '🧅',
  kohlrabi: '🥦',
  parsley: '🌿',
  marigold: '🌼',
  onion: '🧅',
  garlic: '🧄',
  lettuce: '🥬',
  cucumber: '🥒',
  zucchini: '🥒',
  pepper: '🫑',
  bean: '🫘',
  pea: '🌱',
  potato: '🥔',
  cabbage: '🥬',
  spinach: '🥬',
  radish: '🌱',
  beet: '🫀',
  celery: '🌿',
  mint: '🌿',
  dill: '🌿',
  sage: '🌿',
  rosemary: '🌿',
  thyme: '🌿',
  chamomile: '🌼',
  lavender: '💜',
  sunflower: '🌻',
  nasturtium: '🌺',
};

export function getEmoji(plantId: string): string {
  return plantEmoji[plantId] ?? '🌱';
}
