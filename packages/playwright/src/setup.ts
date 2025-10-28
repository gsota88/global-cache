import { globalConfig } from '@woom-cache/core';
import { globalCacheServer } from '@woom-cache/core/server';

export default async function globalSetup() {
  if (globalConfig.disabled) return;

  // Generate unique runId on every global setup call
  globalConfig.newTestRun();

  // If external server url provided -> skip
  if (globalConfig.externalServerUrl) return;

  // If local server already running -> skip
  if (globalCacheServer.isRunning) return;

  await globalCacheServer.start({ basePath: globalConfig.basePath });
  globalConfig.update({ localServerUrl: globalCacheServer.localUrl });
}
