import { Router } from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { SectorControllers } from './Sector.controller';
import { SectorValidations } from './Sector.validation';

const router = Router();

router.post(
  '/',
  validateRequest(SectorValidations.createSectorValidationSchema),
  SectorControllers.createSector,
);

router.get('/', SectorControllers.getSectors);

router.get('/:id', SectorControllers.getSingleSector);

router.put(
  '/:id',
  validateRequest(SectorValidations.updateSectorValidationSchema),
  SectorControllers.updateSector,
);

router.delete('/:id', SectorControllers.deleteSector);

export const SectorRoutes = router;
