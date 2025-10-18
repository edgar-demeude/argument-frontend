export type Pair = [string, string];

export interface GradualInput {
  num_args: number;
  R: Pair[];
  n_samples: number;
  axes?: string[];                // X,Y,Z when num_args > 3
  controlled_args?: Record<string, number>; // sliders for non-visualized args
}

export interface GradualOutput {
  num_args: number;
  hull_volume: number | null;
  hull_area: number | null;
  hull_points: number[][];
  samples: number[][];
  axes?: string[] | null;
}
