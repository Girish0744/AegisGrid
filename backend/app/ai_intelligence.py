from typing import Dict, List, Any

from app.ai_contract import (
    build_decision_context,
    fallback_decision_explanation,
    validate_explanation,
)


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

        explanation = fallback_decision_explanation(context)

        if not validate_explanation(explanation):
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