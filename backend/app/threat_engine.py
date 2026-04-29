from typing import List, Dict
import math

from app.config import TARGET_X, TARGET_Y


MAX_DISTANCE = 707.0


def enrich_clusters_with_threat(clusters: List[Dict]) -> List[Dict]:
    enriched_clusters = []

    for cluster in clusters:
        distance = calculate_distance(
            cluster["center_x"],
            cluster["center_y"],
            TARGET_X,
            TARGET_Y
        )

        eta = calculate_eta(distance, cluster["avg_speed"])

        threat_score = calculate_threat_score(
            distance=distance,
            eta=eta,
            drone_count=cluster["drone_count"],
            confidence=cluster["avg_confidence"]
        )

        enriched_cluster = {
            **cluster,
            "distance_to_target": round(distance, 2),
            "eta": round(eta, 2),
            "threat_score": round(threat_score, 2),
            "threat_level": get_threat_level(threat_score)
        }

        enriched_clusters.append(enriched_cluster)

    return enriched_clusters


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
    confidence: float
) -> float:
    distance_risk = max(0, 1 - (distance / MAX_DISTANCE))
    eta_risk = max(0, 1 - (eta / 120))
    cluster_size_risk = min(1, drone_count / 40)
    confidence_risk = confidence

    score = (
        0.35 * distance_risk +
        0.30 * eta_risk +
        0.20 * cluster_size_risk +
        0.15 * confidence_risk
    )

    return min(1, max(0, score))


def get_threat_level(score: float) -> str:
    if score >= 0.70:
        return "critical"
    if score >= 0.40:
        return "medium"
    return "low"