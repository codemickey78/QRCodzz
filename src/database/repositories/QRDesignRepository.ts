import {QRDesign} from '../entities/QRDesign';
import {Repository} from './Repository';

export type CreateQRDesignInput = Omit<QRDesign, 'createdAt' | 'id' | 'updatedAt'>;
export type UpdateQRDesignInput = Partial<Omit<QRDesign, 'createdAt' | 'id'>>;

export interface QRDesignRepository
  extends Repository<QRDesign, CreateQRDesignInput, UpdateQRDesignInput> {}
