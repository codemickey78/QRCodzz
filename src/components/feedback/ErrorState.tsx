import React from 'react';
import {EmptyState} from './EmptyState';

export function ErrorState() {
  return (
    <EmptyState
      message="Try again, or check whether the requested item is still available."
      title="Something went wrong"
    />
  );
}
