import { Moderator } from "./Moderator";

import { ModeratorEvents } from "./ModeratorEvents";

export type Awaitable<T> = T | PromiseLike<T>;

export declare class ModeratorEmitter {
    public on<K extends keyof ModeratorEvents>(event: K, listener: (...args: ModeratorEvents[K]) => Awaitable<void>): this;
    public on<S extends string | symbol>(
      event: Exclude<S, keyof ModeratorEvents>,
      listener: (...args: any[]) => Awaitable<void>,
    ): this;

    public once<K extends keyof ModeratorEvents>(event: K, listener: (...args: ModeratorEvents[K]) => Awaitable<void>): this;
    public once<S extends string | symbol>(
      event: Exclude<S, keyof ModeratorEvents>,
      listener: (...args: any[]) => Awaitable<void>,
    ): this;

    public emit<K extends keyof ModeratorEvents>(event: K, ...args: ModeratorEvents[K]): boolean;
    public emit<S extends string | symbol>(event: Exclude<S, keyof ModeratorEvents>, ...args: unknown[]): boolean;
}