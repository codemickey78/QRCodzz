import {EntityId} from '../types/id';

export function createEntityId(prefix: string): EntityId {
  return `${prefix}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}
