from typing import Dict, List, Any

from app.ai_contract import (
    build_decision_context,
    fallback_decision_explanation,
    validate_explanation,
)
from app.ai_provider import call_ai_explanation_agent


def generate_decision_explanations(
    clusters: List[Dict],
    decision: Dict
) -> List[Dict[str, Any]]:
    explanations = []

    for assignment in decision.get("assignments", []):
        cluster = next(
            (
                cluster
                for cluster in clusters
                if cluster["cluster_id"] == assignment["cluster_id"]
            ),
            None,
        )

        if cluster is None:
            continue

        context = build_decision_context(cluster, assignment)

        ai_explanation = call_ai_explanation_agent(context)

        if ai_explanation and validate_explanation(ai_explanation, context):
            explanation = ai_explanation
        else:
            explanation = fallback_decision_explanation(context)

        if not validate_explanation(explanation, context):
            explanation = {
                "cluster_id": assignment["cluster_id"],
                "resource_id": assignment["resource_id"],
                "summary": "Decision explanation unavailable.",
                "evidence": ["Fallback validation failed."],
                "confidence_label": "low",
                "if_ignored": "Unable to estimate ignored risk.",
                "trust_status": "failed_validation",
            }

        explanations.append(explanation)

    return explanations

def generate_mission_summary(state: Dict[str, Any]) -> Dict[str, Any]:
    clusters = state.get("clusters", [])
    evaluation = state.get("evaluation", {})
    detections = state.get("detections", [])
    tracks = state.get("tracks", [])
    true_drones = state.get("true_drones", [])

    top_cluster = max(
        clusters,
        key=lambda cluster: cluster.get("threat_score", 0),
        default=None,
    )

    detection_rate = (
        round((len(detections) / len(true_drones)) * 100, 1)
        if true_drones
        else 0
    )

    improvement = evaluation.get("improvement", 0)

    summary = (
        f"AegisGrid is tracking {len(clusters)} active swarm clusters from "
        f"{len(tracks)} fused tracks with an estimated detection rate of "
        f"{detection_rate}%."
    )

    if top_cluster:
        summary += (
            f" Cluster {top_cluster['cluster_id']} is currently the primary "
            f"threat due to {top_cluster.get('threat_level')} threat level, "
            f"ETA {top_cluster.get('eta')}s, and "
            f"{top_cluster.get('drone_count')} tracked drones."
        )

    impact = (
        f"AegisGrid is reducing simulated breach risk by {improvement}% "
        f"compared with the baseline allocation strategy."
    )

    return {
        "summary": summary,
        "impact": impact,
        "detection_rate": detection_rate,
        "trust_status": "deterministic_validated",
    }

def generate_after_action_report(state: Dict[str, Any]) -> Dict[str, Any]:
    evaluation = state.get("evaluation", {})
    report = state.get("report", {})
    clusters = state.get("clusters", [])

    baseline = evaluation.get("baseline", {})
    aegisgrid = evaluation.get("aegisgrid", {})
    improvement = evaluation.get("improvement", 0)

    top_cluster = max(
        clusters,
        key=lambda cluster: cluster.get("threat_score", 0),
        default=None,
    )

    key_findings = [
        f"Baseline breach risk: {baseline.get('breach_risk', 'unavailable')}%",
        f"AegisGrid breach risk: {aegisgrid.get('breach_risk', 'unavailable')}%",
        f"Measured improvement: {improvement}%",
        f"Detection rate: {report.get('detection_rate', 'unavailable')}%",
        f"Estimated missed detections: {report.get('missed_detection_estimate', 'unavailable')}",
    ]

    if top_cluster:
        key_findings.append(
            f"Primary threat cluster: C{top_cluster.get('cluster_id')} "
            f"with threat score {top_cluster.get('threat_score')} "
            f"and ETA {top_cluster.get('eta')}s."
        )

    limitations = [
        "Simulation uses synthetic telemetry rather than real sensor feeds.",
        "AI explanations are grounded in backend metrics and do not control allocation decisions.",
        "Threat assessment depends on sensor confidence, clustering quality, and scenario assumptions.",
    ]

    return {
        "title": "AegisGrid After-Action Report",
        "summary": (
            f"AegisGrid processed the active swarm scenario, compared baseline allocation "
            f"against its optimized response strategy, and measured a simulated breach-risk "
            f"improvement of {improvement}%."
        ),
        "key_findings": key_findings,
        "limitations": limitations,
        "verdict": report.get("verdict", "UNKNOWN"),
        "trust_status": "deterministic_validated",
    }