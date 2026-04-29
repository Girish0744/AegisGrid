from typing import List, Dict


def evaluate_strategies(
    clusters: List[Dict],
    baseline_decision: Dict,
    aegisgrid_decision: Dict
) -> Dict:
    baseline_metrics = evaluate_single_strategy(
        clusters,
        baseline_decision["assignments"]
    )

    aegisgrid_metrics = evaluate_single_strategy(
        clusters,
        aegisgrid_decision["assignments"]
    )

    improvement = baseline_metrics["breach_risk"] - aegisgrid_metrics["breach_risk"]

    return {
        "baseline": baseline_metrics,
        "aegisgrid": aegisgrid_metrics,
        "improvement": round(improvement, 2)
    }


def evaluate_single_strategy(clusters: List[Dict], assignments: List[Dict]) -> Dict:
    assigned_cluster_ids = {
        assignment["cluster_id"]
        for assignment in assignments
    }

    total_threat = sum(cluster["threat_score"] for cluster in clusters)

    if total_threat == 0:
        return {
            "breach_risk": 0,
            "resource_waste": 0,
            "response_efficiency": 0
        }

    covered_threat = sum(
        cluster["threat_score"]
        for cluster in clusters
        if cluster["cluster_id"] in assigned_cluster_ids
    )

    wasted_resources = sum(1 for cluster in clusters 
        if cluster["cluster_id"] in assigned_cluster_ids
        and 
        (
            cluster.get("decoy_ratio", 0) > 0.6
            or cluster.get("false_positive_ratio", 0) > 0.4
        )
    )

    breach_risk = 100 * (1 - covered_threat / total_threat)
    resource_waste = 100 * (wasted_resources / max(1, len(assignments)))
    response_efficiency = 100 - breach_risk - (resource_waste * 0.25)

    return {
        "breach_risk": round(max(0, min(100, breach_risk)), 2),
        "resource_waste": round(max(0, min(100, resource_waste)), 2),
        "response_efficiency": round(max(0, min(100, response_efficiency)), 2)
    }