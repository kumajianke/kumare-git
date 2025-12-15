import { writable } from 'svelte/store';

export type ActiveWorkspace = string | null;

export const activeWorkspace = writable<ActiveWorkspace>(null);
