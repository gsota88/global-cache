import { globalConfig } from '@woom-cache/core';
import { globalCacheServer } from '@woom-cache/core/server';

export default async function globalTeardown() {
  await globalCacheServer.stop();
  globalConfig.update({ localServerUrl: '' });
}
