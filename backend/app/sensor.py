import random
from typing import List, Dict

from app.config import MAP_WIDTH, MAP_HEIGHT


DETECTION_PROBABILITY = 0.78
SENSOR_NOISE_STD = 18
FALSE_POSITIVE_COUNT = 8


def generate_sensor_detections(drones: List[Dict]) -> List[Dict]:
    detections = []

    for drone in drones:
        is_detected = random.random() < DETECTION_PROBABILITY

        if not is_detected:
            continue

        detected_x = drone["true_x"] + random.gauss(0, SENSOR_NOISE_STD)
        detected_y = drone["true_y"] + random.gauss(0, SENSOR_NOISE_STD)

        detection = {
            "id": drone["id"],
            "detected_x": max(0, min(MAP_WIDTH, detected_x)),
            "detected_y": max(0, min(MAP_HEIGHT, detected_y)),
            "confidence": round(random.uniform(0.65, 0.95), 2),
            "sensor_type": random.choice(["radar", "camera"]),
            "is_false_positive": False
        }

        detections.append(detection)

    detections.extend(generate_false_positives())

    return detections


def generate_false_positives() -> List[Dict]:
    false_detections = []

    for i in range(FALSE_POSITIVE_COUNT):
        false_detections.append({
            "id": f"FP-{i+1}",
            "detected_x": random.uniform(0, MAP_WIDTH),
            "detected_y": random.uniform(0, MAP_HEIGHT),
            "confidence": round(random.uniform(0.35, 0.65), 2),
            "sensor_type": random.choice(["radar", "camera"]),
            "is_false_positive": True
        })

    return false_detections