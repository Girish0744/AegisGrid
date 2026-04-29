from typing import List, Dict
import numpy as np
from sklearn.cluster import DBSCAN


DBSCAN_EPS = 90
DBSCAN_MIN_SAMPLES = 4


def cluster_tracks(tracks: List[Dict]) -> List[Dict]:
    if len(tracks) < DBSCAN_MIN_SAMPLES:
        return []

    coordinates = np.array([[track["x"], track["y"]] for track in tracks])

    model = DBSCAN(
        eps=DBSCAN_EPS,
        min_samples=DBSCAN_MIN_SAMPLES
    )

    labels = model.fit_predict(coordinates)

    for track, label in zip(tracks, labels):
        track["cluster_id"] = int(label) if label != -1 else None

    clusters = []

    for label in set(labels):
        if label == -1:
            continue

        members = [
            track for track in tracks
            if track.get("cluster_id") == int(label)
        ]

        center_x = sum(member["x"] for member in members) / len(members)
        center_y = sum(member["y"] for member in members) / len(members)
        avg_speed = sum(member["estimated_speed"] for member in members) / len(members)
        avg_confidence = sum(member["confidence"] for member in members) / len(members)
        avg_heading_alignment = sum(
            member.get("heading_alignment", 0)
            for member in members
        ) / len(members)

        clusters.append({
            "cluster_id": int(label),
            "drone_count": len(members),
            "center_x": round(center_x, 2),
            "center_y": round(center_y, 2),
            "avg_speed": round(avg_speed, 2),
            "avg_confidence": round(avg_confidence, 2),
            "member_ids": [member["id"] for member in members],
            "decoy_ratio": round(sum(1 for member in members if member.get("is_decoy", False)) / len(members),2),
            "false_positive_ratio": round(sum(1 for member in members if member.get("is_false_positive", False)) / len(members),2),
            "member_ids": [member["id"] for member in members],
            "avg_heading_alignment": round(avg_heading_alignment, 2),
        })

    return clusters