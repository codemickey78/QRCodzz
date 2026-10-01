import {createEntityId} from '../../utils/id';
import {nowIso} from '../../utils/date';
import {LocalDatabase} from '../adapters/LocalDatabase';
import {QRDesign} from '../entities/QRDesign';
import {
  CreateQRDesignInput,
  QRDesignRepository,
  UpdateQRDesignInput,
} from './QRDesignRepository';
import {RepositoryQuery} from './Repository';

export class LocalQRDesignRepository implements QRDesignRepository {
  constructor(private readonly database: LocalDatabase) {}

  async create(input: CreateQRDesignInput) {
    const timestamp = nowIso();
    const design: QRDesign = {
      ...input,
      id: createEntityId('qr-design'),
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await this.database.updateSnapshot(snapshot => ({
      ...snapshot,
      qrDesigns: [...snapshot.qrDesigns, design],
    }));

    return design;
  }

  async delete(id: string) {
    await this.database.updateSnapshot(snapshot => ({
      ...snapshot,
      qrDesigns: snapshot.qrDesigns.filter(design => design.id !== id),
    }));
  }

  async getAll(query?: RepositoryQuery) {
    const {qrDesigns} = await this.database.getSnapshot();
    const search = query?.search?.toLowerCase();
    const filtered = search
      ? qrDesigns.filter(design => design.name.toLowerCase().includes(search))
      : qrDesigns;
    const offset = query?.offset ?? 0;
    return filtered.slice(offset, offset + (query?.limit ?? filtered.length));
  }

  async getById(id: string) {
    const {qrDesigns} = await this.database.getSnapshot();
    return qrDesigns.find(design => design.id === id);
  }

  async update(id: string, input: UpdateQRDesignInput) {
    let updatedDesign: QRDesign | undefined;

    await this.database.updateSnapshot(snapshot => ({
      ...snapshot,
      qrDesigns: snapshot.qrDesigns.map(design => {
        if (design.id !== id) {
          return design;
        }

        updatedDesign = {
          ...design,
          ...input,
          id,
          createdAt: design.createdAt,
          updatedAt: nowIso(),
        };

        return updatedDesign;
      }),
    }));

    if (!updatedDesign) {
      throw new Error(`QR design not found: ${id}`);
    }

    return updatedDesign;
  }
}
