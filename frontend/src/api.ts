import axios from "axios";
import type { AegisGridConfig, AegisGridState, ResetResponse } from "./types";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
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

export async function generateAIAfterActionReport() {
  const response = await api.post("/ai/after-action");
  return response.data;
}

export async function analyzeAISnapshot() {
  const response = await api.post("/ai/analyze-snapshot");
  return response.data;
}