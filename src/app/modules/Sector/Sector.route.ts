import { Router } from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { SectorControllers } from './Sector.controller';
import { SectorValidations } from './Sector.validation';

const router = Router();

router.post(
  '/',
  auth('user'),
  validateRequest(SectorValidations.createSectorValidationSchema),
  SectorControllers.createSector,
);

router.get('/', auth('user'), SectorControllers.getSectors);

router.get('/:id', auth('user'), SectorControllers.getSingleSector);

router.put(
  '/:id',
  auth('user'),
  validateRequest(SectorValidations.updateSectorValidationSchema),
  SectorControllers.updateSector,
);

router.delete('/:id', auth('user'), SectorControllers.deleteSector);

export const SectorRoutes = router;
