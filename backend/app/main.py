from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.simulation import generate_drones, update_drones
from app.sensor import generate_sensor_detections
from app.fusion import TRACK_HISTORY, fuse_detections
from app.clustering import cluster_tracks
from app.threat_engine import enrich_clusters_with_threat
from app.decision import allocate_baseline, allocate_aegisgrid
from app.evaluation import evaluate_strategies
from app.config import MAP_HEIGHT, MAP_WIDTH, TARGET_X, TARGET_Y


app = FastAPI(title="AegisGrid API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

current_scenario = "balanced"
DRONE_COUNT = 100

drones = generate_drones(DRONE_COUNT, scenario_type=current_scenario)


@app.get("/")
def root():
    return {
        "message": "AegisGrid backend running",
        "scenario": current_scenario,
        "endpoints": {
            "state": "/state",
            "reset": "/reset",
            "config": "/config"
        }
    }


@app.get("/config")
def get_config():
    return {
        "map_width": MAP_WIDTH,
        "map_height": MAP_HEIGHT,
        "target_x": TARGET_X,
        "target_y": TARGET_Y,
        "scenario": current_scenario,
        "drone_count": DRONE_COUNT
    }


@app.get("/state")
def get_state():
    global drones

    drones = update_drones(drones)

    detections = generate_sensor_detections(drones)
    tracks = fuse_detections(detections)
    clusters = cluster_tracks(tracks)
    threat_clusters = enrich_clusters_with_threat(clusters)

    baseline_decision = allocate_baseline(threat_clusters)
    aegisgrid_decision = allocate_aegisgrid(threat_clusters)

    evaluation = evaluate_strategies(
        threat_clusters,
        baseline_decision,
        aegisgrid_decision
    )

    return {
        "scenario": current_scenario,
        "scenario_type": current_scenario,
        "true_drones": drones,
        "detections": detections,
        "tracks": tracks,
        "clusters": threat_clusters,
        "baseline_decision": baseline_decision,
        "aegisgrid_decision": aegisgrid_decision,
        "evaluation": evaluation
    }


@app.post("/reset")
def reset_simulation(scenario_type: str = "balanced"):
    global drones, current_scenario

    allowed_scenarios = {"balanced", "decoy_heavy", "split_attack"}

    if scenario_type not in allowed_scenarios:
        scenario_type = "balanced"

    current_scenario = scenario_type

    TRACK_HISTORY.clear()
    drones = generate_drones(DRONE_COUNT, scenario_type=current_scenario)

    return {
        "message": "simulation reset",
        "scenario": current_scenario,
        "scenario_type": current_scenario
    }