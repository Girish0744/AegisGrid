export type Drone = {
  id: string;
  true_x?: number;
  true_y?: number;
  x?: number;
  y?: number;
  speed: number;
  heading: number;
  behavior: string;
  is_decoy: boolean;
  status?: string;
};

export type Track = {
  id: string;
  x: number;
  y: number;
  estimated_speed: number;
  heading_alignment: number;
  confidence: number;
  is_false_positive: boolean;
  is_decoy?: boolean;
  behavior?: string;
};

export type Detection = {
  id: string;
  detected_x?: number;
  detected_y?: number;
  x?: number;
  y?: number;
  drone_id?: string;
  estimated_speed?: number;
  heading_alignment?: number;
  confidence?: number;
  sensor_type?: "radar" | "camera" | string;
  source?: string;
  is_false_positive?: boolean;
  is_decoy?: boolean;
  behavior?: string;
};

export type ThreatLevel = "low" | "medium" | "critical";

export type ThreatFactors = {
  proximity_risk?: number;
  eta_risk?: number;
  predicted_proximity_risk?: number;
  predicted_eta_risk?: number;
  trajectory_alignment_risk?: number;
  speed_risk?: number;
  swarm_mass_risk?: number;
  confidence_factor?: number;
  uncertainty_score?: number;
  asset_impact_risk?: number;
};

export type Cluster = {
  cluster_id: number;
  drone_count?: number;
  center_x: number;
  center_y: number;
  cluster_radius?: number;
  cluster_diameter?: number;
  cluster_density?: number;
  avg_speed?: number;
  avg_confidence?: number;
  avg_heading_alignment?: number;
  decoy_ratio?: number;
  false_positive_ratio?: number;
  member_ids?: string[];
  distance_to_target?: number;
  eta?: number;
  current_threat_score?: number;
  predicted_distance_to_target?: number;
  predicted_eta?: number;
  predicted_threat_score?: number;
  threat_delta?: number;
  threat_score?: number;
  threat_level?: ThreatLevel;
  uncertainty_score?: number;
  decision_confidence?: number;
  threat_factors?: ThreatFactors;
  threat_explanation?: string[];
};

export type Assignment = {
  resource_id: string;
  cluster_id: number;
  strategy: string;
  reason: string;
  is_locked?: boolean;
  ticks_remaining?: number;
  seconds_remaining_estimate?: number;
  status?: "held" | "updated" | "switched" | string;
};

export type Decision = {
  strategy: string;
  assignments: Assignment[];
};

export type Metrics = {
  breach_risk: number;
  resource_waste: number;
  response_efficiency: number;
};

export type Evaluation = {
  baseline: Metrics;
  aegisgrid: Metrics;
  improvement: number;
};

export type AegisGridState = {
  scenario?: string;
  scenario_type?: string;
  true_drones: Drone[];
  detections: Detection[];
  tracks: Track[];
  clusters: Cluster[];
  baseline_decision: Decision;
  raw_aegisgrid_decision?: Decision;
  aegisgrid_decision: Decision;
  evaluation: Evaluation;
  ai_insights?: AIInsights;
  report?: DecisionReport;
};

export type DecisionReport = {
  detection_rate?: number;
  missed_detection_estimate?: number;
  cluster_count?: number;
  top_threat_cluster_id?: number | null;
  verdict?: string;
};

export type AegisGridConfig = {
  map_width: number;
  map_height: number;
  target_x: number;
  target_y: number;
  scenario: string;
  drone_count: number;
};

export type DecisionExplanation = {
  cluster_id: number;
  resource_id: string;
  summary: string;
  evidence: string[];
  confidence_label: "low" | "medium" | "high" | string;
  if_ignored: string;
  trust_status: string;
};

export type AIInsights = {
  decision_explanations: DecisionExplanation[];
  mission_summary?: MissionSummary;
  after_action_report?: AfterActionReport;
  trust_status: string;
};

export type MissionSummary = {
  summary: string;
  impact: string;
  detection_rate: number;
  trust_status: string;
};

export type AfterActionReport = {
  title: string;
  summary: string;
  key_findings: string[];
  limitations: string[];
  verdict: string;
  trust_status: string;
};

export type ResetResponse = {
  message: string;
  scenario: string;
};
