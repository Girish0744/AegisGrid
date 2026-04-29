export type Drone = {
  id: string;
  true_x: number;
  true_y: number;
  speed: number;
  heading: number;
  behavior: string;
  is_decoy: boolean;
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
  detected_x: number;
  detected_y: number;
  confidence: number;
  sensor_type: "radar" | "camera";
  is_false_positive: boolean;
  is_decoy: boolean;
  behavior: string;
};

export type ThreatLevel = "low" | "medium" | "critical";

export type Cluster = {
  cluster_id: number;
  drone_count: number;
  center_x: number;
  center_y: number;
  avg_speed: number;
  avg_confidence: number;
  avg_heading_alignment: number;
  decoy_ratio: number;
  false_positive_ratio: number;
  member_ids: string[];
  distance_to_target: number;
  eta: number;
  threat_score: number;
  threat_level: ThreatLevel;
};

export type Assignment = {
  resource_id: string;
  cluster_id: number;
  strategy: string;
  reason: string;
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
  scenario: string;
  scenario_type: string;
  true_drones: Drone[];
  detections: Detection[];
  tracks: Track[];
  clusters: Cluster[];
  baseline_decision: Decision;
  aegisgrid_decision: Decision;
  evaluation: Evaluation;
};

export type AegisGridConfig = {
  map_width: number;
  map_height: number;
  target_x: number;
  target_y: number;
  scenario: string;
  drone_count: number;
};

export type ResetResponse = {
  message: string;
  scenario: string;
};
