import { useContext } from 'react';
import { CraftContext } from '../context/CraftContext';

export const useCrafts = () => {
  const value = useContext(CraftContext);

  if (!value) {
    throw new Error('useCrafts must be used inside CraftProvider.');
  }

  return value;
};
