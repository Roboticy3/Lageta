import { all_params } from "$lib/dat/Levels/Levels";
import type { EntryGenerator } from "./$types";

export const entries:EntryGenerator = () => [...all_params.keys()].map(
  (k) => {return {catchAll: k}}
)