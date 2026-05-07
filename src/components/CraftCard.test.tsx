import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { CraftCard } from './CraftCard';
import type { Craft } from '../types/Craft';

const craft: Craft = {
  id: 'craft-1',
  userId: 'user-1',
  title: 'Patchwork Quilt',
  description: 'A cozy quilt made from saved fabric scraps.',
  materials: ['Cotton squares', 'Thread'],
  photos: [{ id: 'photo-1', url: 'https://example.com/quilt.jpg', alt: 'Quilt' }],
  status: 'work-in-progress',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-02T00:00:00.000Z',
};

describe('CraftCard', () => {
  it('renders craft information', () => {
    render(
      <MemoryRouter>
        <CraftCard craft={craft} />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: /patchwork quilt/i })).toHaveAttribute('href', '/crafts/craft-1');
    expect(screen.getByText('A cozy quilt made from saved fabric scraps.')).toBeInTheDocument();
    expect(screen.getByText('2 materials')).toBeInTheDocument();
    expect(screen.getByText('Work in Progress')).toBeInTheDocument();
  });
});
