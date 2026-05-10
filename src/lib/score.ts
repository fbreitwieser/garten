export function adj4(idx: number, cols: number, rows: number): number[] {
  const r = Math.floor(idx / cols);
  const c = idx % cols;
  const neighbors: number[] = [];
  if (r > 0) neighbors.push((r - 1) * cols + c);
  if (r < rows - 1) neighbors.push((r + 1) * cols + c);
  if (c > 0) neighbors.push(r * cols + (c - 1));
  if (c < cols - 1) neighbors.push(r * cols + (c + 1));
  return neighbors;
}

function pairKey(a: string, b: string): string {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

export function scoreGrid(
  grid: string[],
  cols: number,
  rows: number,
  avoidPairs: Set<string>,
  helpPairs: Set<string>
): number {
  let score = 0;
  const total = cols * rows;

  for (let i = 0; i < total; i++) {
    const a = grid[i];
    if (!a) continue;

    for (const j of adj4(i, cols, rows)) {
      if (j <= i) continue; // count each pair once
      const b = grid[j];
      if (!b) continue;

      if (a === b) {
        score += 1;
      } else {
        const key = pairKey(a, b);
        if (helpPairs.has(key)) score += 3;
        if (avoidPairs.has(key)) score -= 5;
      }
    }
  }

  return score;
}
