import { z } from 'zod';
import { SectorType } from './Sector.const';

const createSectorValidationSchema = z.object({
  body: z.object({
    sectorName: z.string({
      invalid_type_error: 'Sector name must be in string!',
      required_error: 'Sector name is required!',
    }),
    sectorType: z.enum([...SectorType] as [string], {
      required_error: 'Sector type is required!',
    }),
    parent: z
      .string({ invalid_type_error: 'Parent name must be in string!' })
      .default('parent'),
    transaction: z
      .number({ invalid_type_error: 'Transaction must be a number' })
      .default(0),
    isDeleted: z
      .boolean({
        invalid_type_error: 'isDeleted property is either true or false',
      })
      .default(false),
  }),
});

const updateSectorValidationSchema = z.object({
  body: z.object({
    sectorName: z
      .string({
        invalid_type_error: 'Sector name must be in string!',
        required_error: 'Sector name is required',
      })
      .optional(),
    sectorType: z
      .enum([...SectorType] as [string], {
        required_error: 'Sector type is required!',
      })
      .optional(),
    parent: z
      .string({ invalid_type_error: 'Parent name must be in string!' })
      .optional(),
  }),
});

export const SectorValidations = {
  createSectorValidationSchema,
  updateSectorValidationSchema,
};
