/**
 * Prints the size of the generated coach network without touching MongoDB, so
 * route coverage can be checked before committing to a seed run.
 *
 *   npm run network:summary --workspace server
 */
import { DIVISIONS, ALL_STOPS, STOPS_BY_DIVISION } from '../constants/bangladesh';
import { buildPoints, buildRoutes, buildSchedules } from './network';
import { TRIP_DAYS } from './data';
import { listLocalImages } from './uploadImages';

function main(): void {
  const routes = buildRoutes();
  const schedules = buildSchedules(routes);
  const points = buildPoints();

  const routesByDivision = new Map<string, number>();
  for (const route of routes) {
    const key = route.fromDivision === route.toDivision ? route.fromDivision : 'Inter-division';
    routesByDivision.set(key, (routesByDivision.get(key) ?? 0) + 1);
  }

  console.log('TicketBus network coverage');
  console.log('='.repeat(52));
  console.log(`Divisions          ${DIVISIONS.length}`);
  console.log(`Ticketable stops   ${ALL_STOPS.length}`);
  console.log(`Routes             ${routes.length}`);
  console.log(`Daily schedules    ${schedules.length}`);
  console.log(`Terminals          ${points.length}`);
  console.log(`Trips (${TRIP_DAYS} days)   ${schedules.length * TRIP_DAYS}`);
  console.log(`Bus photos on disk ${listLocalImages().length}`);
  console.log('');
  console.log('Routes within each division');
  console.log('-'.repeat(52));

  for (const division of DIVISIONS) {
    const stops = STOPS_BY_DIVISION[division.name] ?? [];
    const count = routesByDivision.get(division.name) ?? 0;
    console.log(
      `${division.name.padEnd(14)} ${String(stops.length).padStart(2)} stops   ${String(count).padStart(4)} routes`,
    );
  }

  console.log(
    `${'Inter-division'.padEnd(14)} ${''.padStart(8)}   ${String(
      routesByDivision.get('Inter-division') ?? 0,
    ).padStart(4)} routes`,
  );
}

main();
