/**
 * Helper types.
 */
import { TTL } from '../shared/ttl';

// Key-value types for strictly typed storage.
export type DefaultKeysSchema = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
export type StringKeys<S extends DefaultKeysSchema> = keyof S & string; // strip number | symbol;

export type ComputeFn<Res> = () => Res | Promise<Res>;
export type AssertFn<Res> = (result: Res) => boolean | Promise<boolean>;
export type KeyParams = { ttl?: TTL };
export type GetArgs<K extends StringKeys<S>, S extends DefaultKeysSchema> =
  | [K, ComputeFn<S[K]>, AssertFn<S[K]>]
  | [K, ComputeFn<S[K]>]
  | [K, KeyParams, ComputeFn<S[K]>, AssertFn<S[K]>]
  | [K, KeyParams, ComputeFn<S[K]>];
