import random
import math
from typing import List, Dict

from app.config import TARGET_X, TARGET_Y, MAP_WIDTH, MAP_HEIGHT


def generate_drones(count: int = 100, scenario_type: str = "balanced") -> List[Dict]:
    if scenario_type == "balanced":
        return generate_balanced_swarm(count)

    if scenario_type == "decoy_heavy":
        return generate_decoy_heavy_swarm(count)

    if scenario_type == "split_attack":
        return generate_split_attack_swarm(count)

    return generate_balanced_swarm(count)


def generate_balanced_swarm(count: int) -> List[Dict]:
    drones = []

    for i in range(count):
        x, y = spawn_from_edge()

        behavior = "direct_attack" if random.random() > 0.3 else "decoy"

        drones.append(create_drone(
            drone_id=f"D-{i+1}",
            x=x,
            y=y,
            speed=random.uniform(6, 12),
            behavior=behavior
        ))

    return drones


def generate_decoy_heavy_swarm(count: int) -> List[Dict]:
    drones = []

    for i in range(count):
        x, y = spawn_from_edge()

        behavior = "decoy" if random.random() < 0.55 else "direct_attack"

        speed = random.uniform(5, 10)
        if behavior == "direct_attack":
            speed = random.uniform(9, 15)

        drones.append(create_drone(
            drone_id=f"D-{i+1}",
            x=x,
            y=y,
            speed=speed,
            behavior=behavior
        ))

    return drones


def generate_split_attack_swarm(count: int) -> List[Dict]:
    drones = []

    groups = [
        ("left", count // 3),
        ("right", count // 3),
        ("top", count - 2 * (count // 3)),
    ]

    drone_index = 1

    for side, group_count in groups:
        for _ in range(group_count):
            x, y = spawn_from_specific_side(side)

            behavior = "direct_attack" if random.random() > 0.25 else "decoy"

            drones.append(create_drone(
                drone_id=f"D-{drone_index}",
                x=x,
                y=y,
                speed=random.uniform(7, 14),
                behavior=behavior
            ))

            drone_index += 1

    return drones


def create_drone(
    drone_id: str,
    x: float,
    y: float,
    speed: float,
    behavior: str
) -> Dict:
    return {
        "id": drone_id,
        "true_x": x,
        "true_y": y,
        "speed": speed,
        "heading": 0,
        "behavior": behavior,
        "is_decoy": behavior == "decoy"
    }


def spawn_from_edge():
    side = random.choice(["top", "bottom", "left", "right"])
    return spawn_from_specific_side(side)


def spawn_from_specific_side(side: str):
    if side == "top":
        return random.uniform(0, MAP_WIDTH), random.uniform(0, 100)

    if side == "bottom":
        return random.uniform(0, MAP_WIDTH), random.uniform(MAP_HEIGHT - 100, MAP_HEIGHT)

    if side == "left":
        return random.uniform(0, 100), random.uniform(0, MAP_HEIGHT)

    return random.uniform(MAP_WIDTH - 100, MAP_WIDTH), random.uniform(0, MAP_HEIGHT)


def update_drones(drones: List[Dict]) -> List[Dict]:
    for drone in drones:
        dx = TARGET_X - drone["true_x"]
        dy = TARGET_Y - drone["true_y"]

        distance = math.sqrt(dx**2 + dy**2)

        if distance > 1:
            dx /= distance
            dy /= distance

            if drone["behavior"] == "direct_attack":
                drone["true_x"] += dx * drone["speed"]
                drone["true_y"] += dy * drone["speed"]

            else:
                angle_offset = random.uniform(-0.6, 0.6)
                cos_a = math.cos(angle_offset)
                sin_a = math.sin(angle_offset)

                new_dx = dx * cos_a - dy * sin_a
                new_dy = dx * sin_a + dy * cos_a

                drone["true_x"] += new_dx * drone["speed"]
                drone["true_y"] += new_dy * drone["speed"]

        drone["heading"] = math.degrees(math.atan2(dy, dx))

    return drones