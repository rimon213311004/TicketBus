const ROW_LABELS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export interface SeatCell {
  seatNumber: string;
  row: number;
  column: number;
}

/**
 * Builds seat numbers like A1..A4, B1..B4 for a 2x2 coach. The aisle sits between
 * columns 2 and 3; the client renders that gap, the numbering stays contiguous.
 */
export function generateSeatMap(totalSeats: number, columnsPerRow = 4): SeatCell[] {
  const seats: SeatCell[] = [];
  let remaining = totalSeats;
  let row = 0;

  while (remaining > 0 && row < ROW_LABELS.length) {
    const inThisRow = Math.min(columnsPerRow, remaining);
    for (let col = 1; col <= inThisRow; col += 1) {
      seats.push({ seatNumber: `${ROW_LABELS[row]}${col}`, row: row + 1, column: col });
    }
    remaining -= inThisRow;
    row += 1;
  }

  return seats;
}

export function seatNumbersFor(totalSeats: number, columnsPerRow = 4): string[] {
  return generateSeatMap(totalSeats, columnsPerRow).map((s) => s.seatNumber);
}
