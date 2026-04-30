from typing import Dict, List, Optional, Tuple
import math

from app.config import TARGET_X, TARGET_Y


PREDICTION_HORIZON_SECONDS = 6
MAX_DISTANCE = 707.0
MAX_REASONABLE_SPEED = 20.0
ETA_CRITICAL_WINDOW = 90.0
MAX_CLUSTER_SIZE = 40.0
HIGH_VALUE_ASSET_FACTOR = 1.0
DEFAULT_DECISION_CONFIDENCE = 0.5


def enrich_clusters_with_threat(
    clusters: List[Dict],
    asset_value: float = HIGH_VALUE_ASSET_FACTOR
) -> List[Dict]:
    enriched_clusters = []

    for cluster in clusters:
        center_x = _safe_float(cluster.get("center_x"))
        center_y = _safe_float(cluster.get("center_y"))
        avg_speed = max(0.0, _safe_float(cluster.get("avg_speed")))
        avg_confidence = clamp(
            _safe_float(cluster.get("avg_confidence"), DEFAULT_DECISION_CONFIDENCE)
        )
        drone_count = max(0, int(cluster.get("drone_count", 0) or 0))

        distance = calculate_distance(center_x, center_y, TARGET_X, TARGET_Y)
        eta = calculate_eta(distance, avg_speed)
        motion_vector = get_motion_vector(cluster, center_x, center_y, avg_speed)
        trajectory_alignment_risk = calculate_trajectory_alignment(
            motion_vector,
            center_x,
            center_y,
            cluster
        )

        predicted_x, predicted_y = predict_position(
            center_x,
            center_y,
            avg_speed,
            motion_vector
        )
        predicted_distance = calculate_distance(
            predicted_x,
            predicted_y,
            TARGET_X,
            TARGET_Y
        )
        predicted_eta = calculate_eta(predicted_distance, avg_speed)

        factors = calculate_threat_factors(
            distance=distance,
            eta=eta,
            predicted_distance=predicted_distance,
            predicted_eta=predicted_eta,
            avg_speed=avg_speed,
            drone_count=drone_count,
            avg_confidence=avg_confidence,
            trajectory_alignment_risk=trajectory_alignment_risk,
            asset_value=asset_value
        )

        current_threat_score = calculate_current_risk(factors)
        predicted_threat_score = calculate_predicted_risk(factors)
        uncertainty_adjusted_risk = min(
            1.0,
            predicted_threat_score + factors["uncertainty_score"] * 0.15
        )
        threat_score = clamp(
            0.35 * current_threat_score +
            0.50 * predicted_threat_score +
            0.15 * uncertainty_adjusted_risk
        )
        threat_delta = predicted_threat_score - current_threat_score
        decision_confidence = clamp(
            avg_confidence * (1 - factors["uncertainty_score"] * 0.25)
        )

        rounded_factors = {
            key: round(value, 2)
            for key, value in factors.items()
        }

        enriched_cluster = {
            **cluster,
            "distance_to_target": round(distance, 2),
            "eta": round(eta, 2),
            "current_threat_score": round(current_threat_score, 2),
            "predicted_distance_to_target": round(predicted_distance, 2),
            "predicted_eta": round(predicted_eta, 2),
            "predicted_threat_score": round(predicted_threat_score, 2),
            "threat_delta": round(threat_delta, 2),
            "threat_score": round(threat_score, 2),
            "threat_level": get_threat_level(threat_score),
            "uncertainty_score": round(factors["uncertainty_score"], 2),
            "decision_confidence": round(decision_confidence, 2),
            "threat_factors": rounded_factors,
            "threat_explanation": build_threat_explanation(
                cluster,
                factors,
                eta,
                predicted_eta,
                threat_delta
            )
        }

        enriched_clusters.append(enriched_cluster)

    return enriched_clusters


def calculate_distance(x1: float, y1: float, x2: float, y2: float) -> float:
    return math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)


def calculate_eta(distance: float, speed: float) -> float:
    if distance <= 0:
        return 0.0

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
    factors = calculate_threat_factors(
        distance=distance,
        eta=eta,
        predicted_distance=distance,
        predicted_eta=eta,
        avg_speed=0.0,
        drone_count=drone_count,
        avg_confidence=confidence,
        trajectory_alignment_risk=heading_alignment,
        asset_value=HIGH_VALUE_ASSET_FACTOR
    )

    return calculate_current_risk(factors)


def calculate_threat_factors(
    distance: float,
    eta: float,
    predicted_distance: float,
    predicted_eta: float,
    avg_speed: float,
    drone_count: int,
    avg_confidence: float,
    trajectory_alignment_risk: float,
    asset_value: float
) -> Dict[str, float]:
    speed_normalized = clamp(avg_speed / MAX_REASONABLE_SPEED)
    alignment = clamp(trajectory_alignment_risk)
    speed_pressure = clamp(speed_normalized * (0.6 + 0.4 * alignment))
    confidence_factor = clamp(avg_confidence)
    uncertainty_score = clamp(1 - confidence_factor)

    return {
        "proximity_risk": calculate_proximity_risk(distance),
        "eta_risk": calculate_eta_risk(eta),
        "predicted_proximity_risk": calculate_proximity_risk(predicted_distance),
        "predicted_eta_risk": calculate_eta_risk(predicted_eta),
        "trajectory_alignment_risk": alignment,
        "speed_risk": speed_pressure,
        "swarm_mass_risk": clamp(drone_count / MAX_CLUSTER_SIZE),
        "confidence_factor": confidence_factor,
        "uncertainty_score": uncertainty_score,
        "asset_impact_risk": clamp(asset_value),
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


def calculate_proximity_risk(distance: float) -> float:
    return clamp(1 - (distance / MAX_DISTANCE))


def calculate_eta_risk(eta: float) -> float:
    return clamp(1 - (eta / ETA_CRITICAL_WINDOW))


def get_motion_vector(
    cluster: Dict,
    center_x: float,
    center_y: float,
    avg_speed: float
) -> Tuple[float, float]:
    velocity_vector = extract_velocity_vector(cluster)
    if velocity_vector:
        return velocity_vector

    target_x = TARGET_X - center_x
    target_y = TARGET_Y - center_y
    target_distance = math.sqrt(target_x ** 2 + target_y ** 2)

    if target_distance <= 0 or avg_speed <= 0:
        return (0.0, 0.0)

    return (
        (target_x / target_distance) * avg_speed,
        (target_y / target_distance) * avg_speed
    )


def extract_velocity_vector(cluster: Dict) -> Optional[Tuple[float, float]]:
    for x_key, y_key in (
        ("velocity_x", "velocity_y"),
        ("avg_velocity_x", "avg_velocity_y"),
        ("vx", "vy"),
    ):
        if x_key in cluster and y_key in cluster:
            velocity_x = _safe_float(cluster.get(x_key))
            velocity_y = _safe_float(cluster.get(y_key))

            if math.sqrt(velocity_x ** 2 + velocity_y ** 2) > 0:
                return (velocity_x, velocity_y)

    return None


def calculate_trajectory_alignment(
    motion_vector: Tuple[float, float],
    center_x: float,
    center_y: float,
    cluster: Dict
) -> float:
    velocity_vector = extract_velocity_vector(cluster)

    if velocity_vector:
        motion_x, motion_y = velocity_vector
        target_x = TARGET_X - center_x
        target_y = TARGET_Y - center_y
        motion_magnitude = math.sqrt(motion_x ** 2 + motion_y ** 2)
        target_magnitude = math.sqrt(target_x ** 2 + target_y ** 2)

        if motion_magnitude <= 0 or target_magnitude <= 0:
            return 0.5

        cosine_similarity = (
            motion_x * target_x + motion_y * target_y
        ) / (motion_magnitude * target_magnitude)

        return clamp(max(0.0, cosine_similarity))

    if "avg_heading_alignment" in cluster:
        return clamp(_safe_float(cluster.get("avg_heading_alignment"), 0.5))

    motion_magnitude = math.sqrt(motion_vector[0] ** 2 + motion_vector[1] ** 2)
    if motion_magnitude > 0:
        return 0.5

    return 0.5


def predict_position(
    center_x: float,
    center_y: float,
    avg_speed: float,
    motion_vector: Tuple[float, float]
) -> Tuple[float, float]:
    motion_x, motion_y = motion_vector
    motion_magnitude = math.sqrt(motion_x ** 2 + motion_y ** 2)

    if motion_magnitude <= 0:
        return (center_x, center_y)

    if extract_motion_speed(motion_vector) > 0:
        return (
            center_x + motion_x * PREDICTION_HORIZON_SECONDS,
            center_y + motion_y * PREDICTION_HORIZON_SECONDS
        )

    unit_x = motion_x / motion_magnitude
    unit_y = motion_y / motion_magnitude

    return (
        center_x + unit_x * avg_speed * PREDICTION_HORIZON_SECONDS,
        center_y + unit_y * avg_speed * PREDICTION_HORIZON_SECONDS
    )


def extract_motion_speed(motion_vector: Tuple[float, float]) -> float:
    return math.sqrt(motion_vector[0] ** 2 + motion_vector[1] ** 2)


def build_threat_explanation(
    cluster: Dict,
    factors: Dict[str, float],
    eta: float,
    predicted_eta: float,
    threat_delta: float
) -> List[str]:
    reasons = []

    if factors["eta_risk"] > 0.7 or eta < 30:
        reasons.append("Low ETA indicates limited response time.")

    if (
        factors["predicted_proximity_risk"] >
        factors["proximity_risk"] + 0.1
    ) or threat_delta > 0.1 or predicted_eta + 5 < eta:
        reasons.append("Projected track moves closer to protected zone.")

    if factors["swarm_mass_risk"] > 0.6:
        reasons.append("Large cluster size increases possible impact.")

    if factors["trajectory_alignment_risk"] > 0.7:
        reasons.append("Trajectory is strongly aligned with the protected zone.")

    if factors["uncertainty_score"] > 0.35:
        reasons.append("Sensor uncertainty is elevated; assessment is conservative.")

    if factors["speed_risk"] > 0.7:
        reasons.append("High average speed compresses response window.")

    if not reasons and factors["proximity_risk"] > 0.5:
        reasons.append("Cluster is within the monitored inner range.")

    if not reasons:
        reasons.append("Threat estimate reflects moderate observable risk factors.")

    return reasons[:4]


def get_threat_level(score: float) -> str:
    if score >= 0.75:
        return "critical"
    if score >= 0.45:
        return "medium"
    return "low"


def clamp(value: float, lower: float = 0.0, upper: float = 1.0) -> float:
    return max(lower, min(upper, value))


def _safe_float(value, default: float = 0.0) -> float:
    try:
        return float(value)
    except (TypeError, ValueError):
        return default
