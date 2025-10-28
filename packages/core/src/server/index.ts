/**
 * Storage Server.
 * An HTTP server that provides a simple key-value globalCache.
 * Can be launched locally or on a dedicated environment (standalone).
 *
 * This file is exported separately from the main index file, to not be loaded in workers.
 */
import http from 'node:http';
import { AddressInfo } from 'net';
import express from 'express';
import { debug } from '../shared/debug';
import { router as routeGet } from './routes/get';
import { router as routeSet } from './routes/set';
import { router as routeGetStale } from './routes/get-stale';
import { router as routeGetStaleList } from './routes/get-stale-list';
import { router as routeClearSession } from './routes/clear';
import { router as routeSetComputing } from './routes/setComputing';
import { errorHandler } from './error';
import { getConfig, GlobalCacheServerConfig, setConfig } from './config';
import { getStorage } from './storage';
import { startExpressServer } from './utils/express';

export class GlobalCacheServer {
  private app = express();
  private server: http.Server | null = null;

  constructor() {
    this.app.use(express.json());
    this.app.use('/', routeGet);
    this.app.use('/', routeSet);
    this.app.use('/', routeGetStale);
    this.app.use('/', routeGetStaleList);
    this.app.use('/', routeClearSession);
    this.app.use('/', routeSetComputing)
    // todo:
    // this.app.get('/', (req, res) => {
    //   res.send('Global Storage Server is running.');
    // });
    // Must be after all other middleware and routes
    this.app.use(errorHandler);
  }

  get port() {
    const { port = 0 } = this.server ? (this.server.address() as AddressInfo) : {};
    return port;
  }

  get localUrl() {
    return `http://localhost:${this.port}`;
  }

  get isRunning() {
    return Boolean(this.server?.listening);
  }

  async start(config: GlobalCacheServerConfig) {
    // todo: if server is already running?
    debug('Starting server...');
    setConfig(this.app, config);
    this.server = await startExpressServer(this.app, config.port);
    debug(`Server started on port: ${this.port}`);
  }

  async stop() {
    if (!this.isRunning) return;
    debug('Stopping server...');
    await new Promise<void>((resolve, reject) => {
      this.server?.close((err) => (err ? reject(err) : resolve()));
    });
    this.server = null;
    debug('Server stopped.');
  }

  async clearTestRun(runId: string) {
    if (!this.isRunning) return;
    const config = getConfig(this.app);
    const { testRunStorage } = getStorage(config, runId);
    await testRunStorage.clear();
  }
}

/* Export a default instance - convenient for usage */
export const globalCacheServer = new GlobalCacheServer();
