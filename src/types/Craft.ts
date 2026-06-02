export type CraftStatus = 'inspiration' | 'work-in-progress' | 'completed';

export interface CraftPhoto {
  id: string;
  url: string;
  alt: string;
}

export type CraftSource =
  | {
      id: string;
      type: 'external';
      url: string;
      label?: string;
      imageUrl?: string;
    }
  | {
      id: string;
      type: 'craft';
      craftId: string;
    };

export interface Craft {
  id: string;
  userId: string;
  title: string;
  description: string;
  materials: string[];
  photos: CraftPhoto[];
  status: CraftStatus;
  sourceUrl?: string;
  sources?: CraftSource[];
  createdAt: string;
  updatedAt: string;
  progress?: number;
  isPublic: boolean;
  tags?: string[];
  sharedWith?: string[];
}

export interface CraftInput {
  title: string;
  description: string;
  materials: string[];
  photos: CraftPhoto[];
  status: CraftStatus;
  sourceUrl?: string;
  sources?: CraftSource[];
  progress?: number;
  tags?: string[];
  isPublic: boolean;
}