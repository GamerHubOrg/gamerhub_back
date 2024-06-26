import { defaultSpeedrundleConfig } from "./games/speedrundle/speedrundle.types";
import { defaultUndercoverConfig } from "./games/undercover/undercover.types";
import { IRoomConfig } from "./types";

export const defaultConfigs: Record<string, IRoomConfig> = {
  undercover: defaultUndercoverConfig,
  speedrundle: defaultSpeedrundleConfig
}