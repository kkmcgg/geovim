import { writable } from 'svelte/store';

export const command = writable(':');
export const graphData = writable([]);
export const showGraph = writable(false);
export const showHelp = writable(false);
export const mode = writable('normal');