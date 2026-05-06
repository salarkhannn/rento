import React from 'react';
import { render, RenderOptions, RenderAPI } from '@testing-library/react-native';

export function renderWithProviders(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
): RenderAPI {
  return render(ui, options);
}
