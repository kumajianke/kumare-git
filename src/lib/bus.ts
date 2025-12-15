import { writable } from 'svelte/store';

export type ActiveWorkspace = 'side' | 'console' | null;

export const activeWorkspace = writable<ActiveWorkspace>(null);
