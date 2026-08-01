import { Router } from 'express';
import * as controller from '../controllers/trip.controller';
import { validate } from '../middleware/validate';
import { optionalAuth } from '../middleware/optionalAuth';
import { searchTripsSchema, tripIdSchema } from '../validators/trip.validator';

export const tripRouter = Router();

tripRouter.get('/search', validate(searchTripsSchema), controller.searchTrips);
tripRouter.get('/:tripId', validate(tripIdSchema), controller.getTrip);
tripRouter.get('/:tripId/seats', optionalAuth, validate(tripIdSchema), controller.getSeats);

export const catalogRouter = Router();

catalogRouter.get('/cities', controller.getCities);
catalogRouter.get('/routes', controller.getRoutes);
catalogRouter.get('/operators', controller.getOperators);
catalogRouter.get('/divisions', controller.getDivisions);
catalogRouter.get('/fleet', controller.getFleet);
