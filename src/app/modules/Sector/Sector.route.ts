import { Router } from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { SectorValidations } from './Sector.validation';
import { SectorControllers } from './Sector.controller';

const router = Router();

router.post(
  '/',
  validateRequest(SectorValidations.createSectorValidationSchema),
  SectorControllers.createSector,
);

router.put(
  '/:id',
  validateRequest(SectorValidations.updateSectorValidationSchema),
  SectorControllers.updateSector,
);

router.delete('/:id', SectorControllers.deleteSector);

export const SectorRoutes = router;
