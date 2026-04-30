import axios from "axios";
import type { AegisGridConfig, AegisGridState, ResetResponse } from "./types";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
});

export async function getState() {
  const response = await api.get<AegisGridState>("/state");
  return response.data;
}

export async function resetSimulation(scenarioType?: string) {
  const response = await api.post<ResetResponse>("/reset", undefined, {
    params: scenarioType ? { scenario_type: scenarioType } : undefined,
  });
  return response.data;
}

export async function getConfig() {
  const response = await api.get<AegisGridConfig>("/config");
  return response.data;
}