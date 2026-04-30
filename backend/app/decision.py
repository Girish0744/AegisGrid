from typing import List, Dict


RESOURCE_COUNT = 3


def allocate_baseline(clusters: List[Dict]) -> Dict:
    """
    Baseline strategy:
    allocate resources to clusters closest to the target.
    """

    sorted_clusters = sorted(
        clusters,
        key=lambda cluster: cluster["distance_to_target"]
    )

    assignments = []

    for index, cluster in enumerate(sorted_clusters[:RESOURCE_COUNT]):
        assignments.append({
            "resource_id": f"R-{index + 1}",
            "cluster_id": cluster["cluster_id"],
            "strategy": "baseline",
            "reason": "Nearest cluster to target"
        })

    return {
        "strategy": "baseline",
        "assignments": assignments
    }


def allocate_aegisgrid(clusters: List[Dict]) -> Dict:
    """
    AegisGrid strategy:
    allocate resources based on threat score, ETA, and cluster size.
    """

    sorted_clusters = sorted(
        clusters,
        key=lambda cluster: (
            cluster["threat_score"],
            -cluster["eta"],
            cluster["drone_count"]
        ),
        reverse=True
    )

    assignments = []

    for index, cluster in enumerate(sorted_clusters[:RESOURCE_COUNT]):
        assignments.append({
            "resource_id": f"R-{index + 1}",
            "cluster_id": cluster["cluster_id"],
            "strategy": "aegisgrid",
            "reason": "Highest threat score under limited resources"
        })

    return {
        "strategy": "aegisgrid",
        "assignments": assignments
    }
