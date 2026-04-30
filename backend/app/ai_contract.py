from typing import Dict, List, Any


REQUIRED_EXPLANATION_KEYS = {
    "cluster_id",
    "resource_id",
    "summary",
    "evidence",
    "confidence_label",
    "if_ignored",
    "trust_status",
}


def build_decision_context(cluster: Dict, assignment: Dict) -> Dict[str, Any]:
    return {
        "cluster_id": cluster["cluster_id"],
        "resource_id": assignment["resource_id"],
        "threat_score": cluster.get("threat_score"),
        "threat_level": cluster.get("threat_level"),
        "eta": cluster.get("eta"),
        "drone_count": cluster.get("drone_count"),
        "avg_confidence": cluster.get("avg_confidence"),
        "distance_to_target": cluster.get("distance_to_target"),
        "reason_from_decision_engine": assignment.get("reason"),
    }


def fallback_decision_explanation(context: Dict[str, Any]) -> Dict[str, Any]:
    evidence = [
        f"Threat level: {context.get('threat_level')}",
        f"Threat score: {context.get('threat_score')}",
        f"ETA: {context.get('eta')}s",
        f"Drone count: {context.get('drone_count')}",
        f"Sensor confidence: {context.get('avg_confidence')}",
    ]

    return {
        "cluster_id": context["cluster_id"],
        "resource_id": context["resource_id"],
        "summary": (
            f"Resource {context['resource_id']} is assigned to Cluster "
            f"{context['cluster_id']} because it presents elevated operational risk."
        ),
        "evidence": evidence,
        "confidence_label": confidence_label(context.get("avg_confidence", 0)),
        "if_ignored": (
            "If ignored, this cluster may continue contributing to breach risk "
            "because of its ETA, swarm size, and threat score."
        ),
        "trust_status": "deterministic_fallback",
    }


def confidence_label(confidence: float) -> str:
    if confidence >= 0.75:
        return "high"
    if confidence >= 0.5:
        return "medium"
    return "low"


def validate_explanation(explanation: Dict[str, Any], context: Dict[str, Any] | None = None) -> bool:
    if not isinstance(explanation, dict):
        return False

    if not REQUIRED_EXPLANATION_KEYS.issubset(explanation.keys()):
        return False

    if not isinstance(explanation["evidence"], list):
        return False

    if len(explanation["evidence"]) == 0:
        return False

    if explanation["confidence_label"] not in {"low", "medium", "high"}:
        return False

    if context is None:
        return True

    if explanation["cluster_id"] != context["cluster_id"]:
        return False

    if explanation["resource_id"] != context["resource_id"]:
        return False

    allowed_values = [
        str(context.get("threat_score")),
        str(context.get("threat_level")),
        str(context.get("eta")),
        str(context.get("drone_count")),
        str(context.get("avg_confidence")),
        str(context.get("distance_to_target")),
    ]

    evidence_text = " ".join(str(item) for item in explanation["evidence"])

    has_grounding = any(
        value != "None" and value in evidence_text
        for value in allowed_values
    )

    if not has_grounding:
        return False

    return True