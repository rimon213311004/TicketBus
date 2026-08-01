import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/response';
import * as tripService from '../services/trip.service';

function validated<T>(req: Request): T {
  return ((req as Request & { validatedQuery?: unknown }).validatedQuery ?? req.query) as T;
}

export const searchTrips = asyncHandler(async (req: Request, res: Response) => {
  const result = await tripService.searchTrips(validated<tripService.TripSearchInput>(req));
  return sendSuccess(res, result);
});

export const getTrip = asyncHandler(async (req: Request, res: Response) => {
  const trip = await tripService.getTripById(req.params.tripId);
  return sendSuccess(res, { trip });
});

export const getSeats = asyncHandler(async (req: Request, res: Response) => {
  const seats = await tripService.getSeatAvailability(req.params.tripId, req.user?.id);
  return sendSuccess(res, seats);
});

export const getCities = asyncHandler(async (_req: Request, res: Response) => {
  return sendSuccess(res, await tripService.listCities());
});

export const getRoutes = asyncHandler(async (_req: Request, res: Response) => {
  return sendSuccess(res, { routes: await tripService.listRoutes() });
});

export const getOperators = asyncHandler(async (_req: Request, res: Response) => {
  return sendSuccess(res, { operators: await tripService.listOperators() });
});

export const getDivisions = asyncHandler(async (_req: Request, res: Response) => {
  return sendSuccess(res, await tripService.listDivisions());
});

export const getFleet = asyncHandler(async (_req: Request, res: Response) => {
  return sendSuccess(res, { photos: await tripService.listFleetPhotos() });
});
