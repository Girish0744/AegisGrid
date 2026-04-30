from typing import List, Dict


RESOURCE_COUNT = 3
DECISION_HOLD_TICKS = 6
SWITCH_THRESHOLD = 0.18
TICK_SECONDS_ESTIMATE = 0.8
MAX_CLUSTER_REASSOCIATION_DISTANCE = 140.0


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

    sorted_clusters = sort_clusters_for_aegisgrid(clusters)

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


def stabilize_assignments(
    new_decision: Dict,
    clusters: List[Dict],
    previous_state: Dict,
    hold_ticks: int = DECISION_HOLD_TICKS,
    switch_threshold: float = SWITCH_THRESHOLD
) -> Dict:
    """
    Keep recommendations readable by holding resource assignments briefly.
    A held assignment switches early only when a new cluster is materially higher risk.
    """

    cluster_by_id = {
        cluster["cluster_id"]: cluster
        for cluster in clusters
    }
    previous_assignments = previous_state.setdefault("assignments", {})
    stabilized_assignments = []
    next_assignments = {}
    occupied_cluster_ids = set()
    sorted_clusters = sort_clusters_for_aegisgrid(clusters)

    for new_assignment in new_decision.get("assignments", []):
        resource_id = new_assignment["resource_id"]
        previous_assignment = previous_assignments.get(resource_id)
        available_assignment = get_available_assignment(
            new_assignment,
            sorted_clusters,
            occupied_cluster_ids
        )

        stabilized_assignment = choose_stabilized_assignment(
            new_assignment=available_assignment,
            previous_assignment=previous_assignment,
            cluster_by_id=cluster_by_id,
            occupied_cluster_ids=occupied_cluster_ids,
            hold_ticks=hold_ticks,
            switch_threshold=switch_threshold
        )

        stabilized_assignments.append(stabilized_assignment)
        occupied_cluster_ids.add(stabilized_assignment["cluster_id"])
        next_assignments[resource_id] = {
            "cluster_id": stabilized_assignment["cluster_id"],
            "ticks_remaining": stabilized_assignment["ticks_remaining"],
            "center_x": cluster_by_id.get(
                stabilized_assignment["cluster_id"],
                {}
            ).get("center_x"),
            "center_y": cluster_by_id.get(
                stabilized_assignment["cluster_id"],
                {}
            ).get("center_y"),
            "assignment": stabilized_assignment
        }

    previous_state["assignments"] = next_assignments

    return {
        **new_decision,
        "strategy": "aegisgrid",
        "assignments": stabilized_assignments
    }


def choose_stabilized_assignment(
    new_assignment: Dict,
    previous_assignment: Dict,
    cluster_by_id: Dict,
    occupied_cluster_ids: set,
    hold_ticks: int,
    switch_threshold: float
) -> Dict:
    new_cluster_id = new_assignment["cluster_id"]
    previous_cluster_id = resolve_previous_cluster_id(
        previous_assignment,
        cluster_by_id,
        occupied_cluster_ids
    )

    if (
        not previous_assignment
        or previous_cluster_id not in cluster_by_id
        or previous_cluster_id in occupied_cluster_ids
    ):
        return build_assignment_state(
            new_assignment,
            ticks_remaining=hold_ticks,
            status="updated",
            reason="Recommendation updated and held for operator review."
        )

    previous_ticks = max(0, int(previous_assignment.get("ticks_remaining", 0)))

    if previous_ticks <= 0:
        return build_assignment_state(
            new_assignment,
            ticks_remaining=hold_ticks,
            status="updated",
            reason="Recommendation refreshed after hold window."
        )

    if (
        new_cluster_id != previous_cluster_id
        and new_cluster_id not in occupied_cluster_ids
    ):
        previous_priority = get_cluster_priority(cluster_by_id[previous_cluster_id])
        new_priority = get_cluster_priority(cluster_by_id.get(new_cluster_id, {}))

        if should_switch_assignment(
            previous_priority,
            new_priority,
            switch_threshold
        ):
            return build_assignment_state(
                new_assignment,
                ticks_remaining=hold_ticks,
                status="switched",
                reason="Updated early because a higher-priority cluster exceeded the switch threshold."
            )

    held_assignment = {
        **new_assignment,
        "cluster_id": previous_cluster_id,
        "reason": "Held for operator review. Cluster remains within acceptable priority range."
    }

    return build_assignment_state(
        held_assignment,
        ticks_remaining=previous_ticks - 1,
        status="held",
        reason=held_assignment["reason"]
    )


def should_switch_assignment(
    previous_priority: float,
    new_priority: float,
    switch_threshold: float
) -> bool:
    return new_priority >= previous_priority + switch_threshold


def resolve_previous_cluster_id(
    previous_assignment: Dict,
    cluster_by_id: Dict,
    occupied_cluster_ids: set
):
    if not previous_assignment:
        return None

    previous_cluster_id = previous_assignment.get("cluster_id")

    if (
        previous_cluster_id in cluster_by_id
        and previous_cluster_id not in occupied_cluster_ids
    ):
        return previous_cluster_id

    previous_x = previous_assignment.get("center_x")
    previous_y = previous_assignment.get("center_y")

    if previous_x is None or previous_y is None:
        return previous_cluster_id

    nearest_cluster = None
    nearest_distance = None

    for cluster in cluster_by_id.values():
        if cluster["cluster_id"] in occupied_cluster_ids:
            continue

        distance = calculate_distance(
            previous_x,
            previous_y,
            cluster.get("center_x", previous_x),
            cluster.get("center_y", previous_y)
        )

        if nearest_distance is None or distance < nearest_distance:
            nearest_cluster = cluster
            nearest_distance = distance

    if (
        nearest_cluster
        and nearest_distance is not None
        and nearest_distance <= MAX_CLUSTER_REASSOCIATION_DISTANCE
    ):
        return nearest_cluster["cluster_id"]

    return previous_cluster_id


def calculate_distance(x1: float, y1: float, x2: float, y2: float) -> float:
    return ((x2 - x1) ** 2 + (y2 - y1) ** 2) ** 0.5


def get_cluster_priority(cluster: Dict) -> float:
    return float(cluster.get("threat_score", 0) or 0)


def get_available_assignment(
    assignment: Dict,
    sorted_clusters: List[Dict],
    occupied_cluster_ids: set
) -> Dict:
    if assignment["cluster_id"] not in occupied_cluster_ids:
        return assignment

    for cluster in sorted_clusters:
        if cluster["cluster_id"] not in occupied_cluster_ids:
            return {
                **assignment,
                "cluster_id": cluster["cluster_id"],
                "reason": "Highest available threat score under limited resources"
            }

    return assignment


def sort_clusters_for_aegisgrid(clusters: List[Dict]) -> List[Dict]:
    return sorted(
        clusters,
        key=lambda cluster: (
            cluster["threat_score"],
            -cluster["eta"],
            cluster["drone_count"]
        ),
        reverse=True
    )


def build_assignment_state(
    assignment: Dict,
    ticks_remaining: int,
    status: str,
    reason: str
) -> Dict:
    ticks = max(0, ticks_remaining)

    return {
        **assignment,
        "reason": reason,
        "is_locked": ticks > 0,
        "ticks_remaining": ticks,
        "seconds_remaining_estimate": round(ticks * TICK_SECONDS_ESTIMATE, 1),
        "status": status
    }
