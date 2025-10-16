export interface GradualResult {
  num_args: number;
  hull_volume: number | null;
  hull_area: number | null;
  hull_points: number[][];
  samples: number[][];
}
