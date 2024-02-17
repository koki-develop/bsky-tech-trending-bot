import { setTimeout } from "timers/promises";

export const sleep = async (ms: number) => setTimeout(ms);
