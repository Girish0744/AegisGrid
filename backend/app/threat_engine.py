from typing import Dict, List, Tuple
import math

from app.config import TARGET_X, TARGET_Y


PREDICTION_HORIZON_SECONDS = 6
MAX_DISTANCE = 707.0
MAX_REASONABLE_SPEED = 20.0
ETA_CRITICAL_WINDOW = 90.0
HIGH_VALUE_ASSET_FACTOR = 1.0


def enrich_clusters_with_threat(clusters: List[Dict]) -> List[Dict]:
    enriched_clusters = []

    for cluster in clusters:
        assessment = assess_cluster_threat(cluster)
        enriched_clusters.append({
            **cluster,
            **assessment
        })

    return enriched_clusters


def assess_cluster_threat(
    cluster: Dict,
    asset_value: float = HIGH_VALUE_ASSET_FACTOR
) -> Dict:
    center_x = cluster["center_x"]
    center_y = cluster["center_y"]
    avg_speed = cluster.get("avg_speed", 0)
    avg_confidence = clamp(cluster.get("avg_confidence", 0.5))

    distance = calculate_distance(center_x, center_y, TARGET_X, TARGET_Y)
    eta = calculate_eta(distance, avg_speed)
    motion_x, motion_y = estimate_motion_vector(cluster)
    alignment = calculate_trajectory_alignment(
        motion_x,
        motion_y,
        TARGET_X - center_x,
        TARGET_Y - center_y
    )
    predicted_x, predicted_y = predict_position(
        center_x,
        center_y,
        motion_x,
        motion_y,
        avg_speed,
        distance
    )
    predicted_distance = calculate_distance(
        predicted_x,
        predicted_y,
        TARGET_X,
        TARGET_Y
    )
    predicted_eta = calculate_eta(predicted_distance, avg_speed)

    factors = build_threat_factors(
        distance=distance,
        eta=eta,
        predicted_distance=predicted_distance,
        predicted_eta=predicted_eta,
        trajectory_alignment=alignment,
        avg_speed=avg_speed,
        drone_count=cluster.get("drone_count", 0),
        avg_confidence=avg_confidence,
        asset_value=asset_value
    )
    current_risk = calculate_current_risk(factors)
    predicted_risk = calculate_predicted_risk(factors)
    uncertainty_adjusted_risk = min(
        1.0,
        predicted_risk + factors["uncertainty_score"] * 0.15
    )
    final_threat = clamp(
        0.35 * current_risk +
        0.50 * predicted_risk +
        0.15 * uncertainty_adjusted_risk
    )
    decision_confidence = clamp(
        avg_confidence * (1 - factors["uncertainty_score"] * 0.25)
    )
    threat_delta = predicted_risk - current_risk

    return {
        "distance_to_target": round(distance, 2),
        "eta": round(eta, 2),
        "current_threat_score": round(current_risk, 3),
        "predicted_distance_to_target": round(predicted_distance, 2),
        "predicted_eta": round(predicted_eta, 2),
        "predicted_threat_score": round(predicted_risk, 3),
        "threat_delta": round(threat_delta, 3),
        "threat_score": round(final_threat, 3),
        "threat_level": get_threat_level(final_threat),
        "uncertainty_score": round(factors["uncertainty_score"], 3),
        "decision_confidence": round(decision_confidence, 3),
        "threat_factors": {
            key: round(value, 3)
            for key, value in factors.items()
        },
        "threat_explanation": build_threat_explanation(
            factors=factors,
            eta=eta,
            predicted_eta=predicted_eta,
            threat_delta=threat_delta
        )
    }


def build_threat_factors(
    distance: float,
    eta: float,
    predicted_distance: float,
    predicted_eta: float,
    trajectory_alignment: float,
    avg_speed: float,
    drone_count: int,
    avg_confidence: float,
    asset_value: float
) -> Dict[str, float]:
    proximity_risk = distance_to_risk(distance)
    eta_risk = eta_to_risk(eta)
    predicted_proximity_risk = distance_to_risk(predicted_distance)
    predicted_eta_risk = eta_to_risk(predicted_eta)
    speed_risk = clamp(avg_speed / MAX_REASONABLE_SPEED)
    swarm_mass_risk = clamp(drone_count / 40)
    confidence_factor = clamp(avg_confidence)
    uncertainty_score = clamp(1 - confidence_factor)
    asset_impact_risk = clamp(asset_value)

    return {
        "proximity_risk": proximity_risk,
        "eta_risk": eta_risk,
        "predicted_proximity_risk": predicted_proximity_risk,
        "predicted_eta_risk": predicted_eta_risk,
        "trajectory_alignment_risk": clamp(trajectory_alignment),
        "speed_risk": speed_risk,
        "swarm_mass_risk": swarm_mass_risk,
        "confidence_factor": confidence_factor,
        "uncertainty_score": uncertainty_score,
        "asset_impact_risk": asset_impact_risk
    }


def calculate_current_risk(factors: Dict[str, float]) -> float:
    return clamp(
        0.20 * factors["proximity_risk"] +
        0.25 * factors["eta_risk"] +
        0.15 * factors["trajectory_alignment_risk"] +
        0.15 * factors["speed_risk"] +
        0.15 * factors["swarm_mass_risk"] +
        0.10 * factors["asset_impact_risk"]
    )


def calculate_predicted_risk(factors: Dict[str, float]) -> float:
    return clamp(
        0.25 * factors["predicted_proximity_risk"] +
        0.25 * factors["predicted_eta_risk"] +
        0.15 * factors["trajectory_alignment_risk"] +
        0.15 * factors["speed_risk"] +
        0.10 * factors["swarm_mass_risk"] +
        0.10 * factors["asset_impact_risk"]
    )


def estimate_motion_vector(cluster: Dict) -> Tuple[float, float]:
    velocity_x = cluster.get("velocity_x")
    velocity_y = cluster.get("velocity_y")

    if velocity_x is not None and velocity_y is not None:
        return normalize_vector(velocity_x, velocity_y, neutral=(0.0, 0.0))

    center_x = cluster["center_x"]
    center_y = cluster["center_y"]
    return normalize_vector(
        TARGET_X - center_x,
        TARGET_Y - center_y,
        neutral=(0.0, 0.0)
    )


def calculate_trajectory_alignment(
    motion_x: float,
    motion_y: float,
    target_x: float,
    target_y: float
) -> float:
    target_unit_x, target_unit_y = normalize_vector(
        target_x,
        target_y,
        neutral=(0.0, 0.0)
    )
    motion_magnitude = math.sqrt(motion_x ** 2 + motion_y ** 2)
    target_magnitude = math.sqrt(target_unit_x ** 2 + target_unit_y ** 2)

    if motion_magnitude == 0 or target_magnitude == 0:
        return 0.5

    alignment = motion_x * target_unit_x + motion_y * target_unit_y
    return clamp((alignment + 1) / 2)


def predict_position(
    center_x: float,
    center_y: float,
    motion_x: float,
    motion_y: float,
    avg_speed: float,
    distance_to_target: float
) -> Tuple[float, float]:
    if avg_speed <= 0 or distance_to_target <= 0:
        return center_x, center_y

    travel_distance = min(
        avg_speed * PREDICTION_HORIZON_SECONDS,
        distance_to_target
    )

    return (
        center_x + motion_x * travel_distance,
        center_y + motion_y * travel_distance
    )


def build_threat_explanation(
    factors: Dict[str, float],
    eta: float,
    predicted_eta: float,
    threat_delta: float
) -> List[str]:
    reasons = []

    if factors["eta_risk"] > 0.7:
        reasons.append("Low ETA indicates limited response time.")

    if factors["predicted_proximity_risk"] > factors["proximity_risk"] + 0.1:
        reasons.append("Projected track moves closer to protected zone.")

    if predicted_eta < eta and threat_delta > 0.05:
        reasons.append("Short-horizon forecast shows increasing threat.")

    if factors["swarm_mass_risk"] > 0.6:
        reasons.append("Large cluster size increases possible impact.")

    if factors["trajectory_alignment_risk"] > 0.7:
        reasons.append("Trajectory is strongly aligned with the protected zone.")

    if factors["speed_risk"] > 0.7:
        reasons.append("High average speed compresses response window.")

    if factors["uncertainty_score"] > 0.35:
        reasons.append("Sensor uncertainty is elevated; assessment is conservative.")

    if not reasons:
        reasons.append("Threat is based on proximity, ETA, speed, cluster size, and track confidence.")

    return reasons[:4]


def calculate_distance(x1: float, y1: float, x2: float, y2: float) -> float:
    return math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)


def calculate_eta(distance: float, speed: float) -> float:
    if speed <= 0:
        return 999.0

    return distance / speed


def calculate_threat_score(
    distance: float,
    eta: float,
    drone_count: int,
    confidence: float,
    heading_alignment: float
) -> float:
    factors = build_threat_factors(
        distance=distance,
        eta=eta,
        predicted_distance=distance,
        predicted_eta=eta,
        trajectory_alignment=heading_alignment,
        avg_speed=0,
        drone_count=drone_count,
        avg_confidence=confidence,
        asset_value=HIGH_VALUE_ASSET_FACTOR
    )
    return calculate_current_risk(factors)


def distance_to_risk(distance: float) -> float:
    return clamp(1 - (distance / MAX_DISTANCE))


def eta_to_risk(eta: float) -> float:
    return clamp(1 - (eta / ETA_CRITICAL_WINDOW))


def normalize_vector(
    x: float,
    y: float,
    neutral: Tuple[float, float]
) -> Tuple[float, float]:
    magnitude = math.sqrt(x ** 2 + y ** 2)

    if magnitude == 0:
        return neutral

    return x / magnitude, y / magnitude


def get_threat_level(score: float) -> str:
    if score >= 0.75:
        return "critical"
    if score >= 0.45:
        return "medium"
    return "low"


def clamp(value: float) -> float:
    return max(0, min(1, value))
