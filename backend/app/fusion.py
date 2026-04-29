from typing import List, Dict
import math


TRACK_HISTORY = {}
MIN_CONFIDENCE = 0.5
SMOOTHING_WINDOW = 3


def fuse_detections(detections: List[Dict]) -> List[Dict]:
    tracks = []

    for detection in detections:
        if detection["confidence"] < MIN_CONFIDENCE:
            continue

        drone_id = detection["id"]

        if drone_id not in TRACK_HISTORY:
            TRACK_HISTORY[drone_id] = []

        TRACK_HISTORY[drone_id].append({
            "x": detection["detected_x"],
            "y": detection["detected_y"],
            "confidence": detection["confidence"]
        })

        TRACK_HISTORY[drone_id] = TRACK_HISTORY[drone_id][-SMOOTHING_WINDOW:]

        history = TRACK_HISTORY[drone_id]

        avg_x = sum(point["x"] for point in history) / len(history)
        avg_y = sum(point["y"] for point in history) / len(history)
        avg_confidence = sum(point["confidence"] for point in history) / len(history)

        estimated_speed = estimate_speed(history)

        tracks.append({
            "id": drone_id,
            "x": round(avg_x, 2),
            "y": round(avg_y, 2),
            "estimated_speed": round(estimated_speed, 2),
            "confidence": round(avg_confidence, 2),
            "is_false_positive": detection.get("is_false_positive", False)
        })

    return tracks


def estimate_speed(history: List[Dict]) -> float:
    if len(history) < 2:
        return 0.0

    first = history[0]
    last = history[-1]

    dx = last["x"] - first["x"]
    dy = last["y"] - first["y"]

    distance = math.sqrt(dx**2 + dy**2)

    return distance / max(1, len(history) - 1)