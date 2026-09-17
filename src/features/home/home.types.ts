export const LOCATIONS = ['Studio', 'House', 'Commercial', 'Residential'] as const;
export const ROOM_COUNTS = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

export const CLEAN_TYPES = [
  { name: 'Standard', estimate: 'Estimated 2 hours' },
  { name: 'Deep Clean', estimate: 'Estimated 2.5-3 hours' },
  { name: 'Moving In/Out', estimate: 'Estimated 4.5-5 hours' },
  { name: 'Post Construction', estimate: 'Estimated 4.5-5 hours' },
] as const;

export type Location = (typeof LOCATIONS)[number];
export type RoomCount = (typeof ROOM_COUNTS)[number];
export type CleanType = (typeof CLEAN_TYPES)[number]['name'];
