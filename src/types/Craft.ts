export type CraftStatus = 'inspiration' | 'work-in-progress' | 'completed';

export interface CraftPhoto {
  id: string;
  url: string;
  alt: string;
}

export interface Craft {
  id: string;
  userId: string;
  title: string;
  description: string;
  materials: string[];
  photos: CraftPhoto[];
  status: CraftStatus;
  sourceUrl?: string;
  createdAt: string;
  updatedAt: string;
  progress?: number;
}

export interface CraftInput {
  title: string;
  description: string;
  materials: string[];
  photos: CraftPhoto[];
  status: CraftStatus;
  sourceUrl?: string;
  progress?: number;
}
