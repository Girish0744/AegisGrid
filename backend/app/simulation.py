import random
import math
from typing import List, Dict

from app.config import TARGET_X, TARGET_Y, MAP_WIDTH, MAP_HEIGHT


def generate_drones(count: int = 100) -> List[Dict]:
    drones = []

    for i in range(count):
        # spawn from edges
        side = random.choice(["top", "bottom", "left", "right"])

        if side == "top":
            x, y = random.uniform(0, MAP_WIDTH), random.uniform(0, 100)
        elif side == "bottom":
            x, y = random.uniform(0, MAP_WIDTH), random.uniform(MAP_HEIGHT - 100, MAP_HEIGHT)
        elif side == "left":
            x, y = random.uniform(0, 100), random.uniform(0, MAP_HEIGHT)
        else:
            x, y = random.uniform(MAP_WIDTH - 100, MAP_WIDTH), random.uniform(0, MAP_HEIGHT)

        # assign behavior
        behavior = "direct_attack" if random.random() > 0.3 else "decoy"

        drone = {
            "id": f"D-{i+1}",
            "true_x": x,
            "true_y": y,
            "speed": random.uniform(6, 12),
            "heading": 0,
            "behavior": behavior,
            "is_decoy": behavior == "decoy"
        }

        drones.append(drone)

    return drones

def update_drones(drones: List[Dict]) -> List[Dict]:
    for drone in drones:
        dx = TARGET_X - drone["true_x"]
        dy = TARGET_Y - drone["true_y"]

        distance = math.sqrt(dx**2 + dy**2)

        if distance > 1:
            # normalize direction
            dx /= distance
            dy /= distance

            if drone["behavior"] == "direct_attack":
                # move directly to target
                drone["true_x"] += dx * drone["speed"]
                drone["true_y"] += dy * drone["speed"]

            else:
                # decoy movement: slightly off-path
                angle_offset = random.uniform(-0.5, 0.5)
                cos_a = math.cos(angle_offset)
                sin_a = math.sin(angle_offset)

                new_dx = dx * cos_a - dy * sin_a
                new_dy = dx * sin_a + dy * cos_a

                drone["true_x"] += new_dx * drone["speed"]
                drone["true_y"] += new_dy * drone["speed"]

        drone["heading"] = math.degrees(math.atan2(dy, dx))

    return drones