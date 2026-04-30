from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.simulation import generate_drones, update_drones
from app.sensor import generate_sensor_detections
from app.fusion import TRACK_HISTORY, fuse_detections
from app.clustering import cluster_tracks
from app.threat_engine import enrich_clusters_with_threat
from app.decision import (
    allocate_baseline,
    allocate_aegisgrid,
    stabilize_assignments
)
from app.ai_intelligence import generate_decision_explanations, generate_mission_summary, generate_after_action_report
from app.ai_provider import call_ai_after_action_agent, call_ai_snapshot_agent
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
DECISION_STATE = {}
SIMULATION_TICK = 0

drones = generate_drones(DRONE_COUNT, scenario_type=current_scenario)
LATEST_STATE = {}

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
    global drones, SIMULATION_TICK

    SIMULATION_TICK += 1
    DECISION_STATE["current_tick"] = SIMULATION_TICK

    drones = update_drones(drones)

    detections = generate_sensor_detections(drones)
    tracks = fuse_detections(detections)
    clusters = cluster_tracks(tracks)
    threat_clusters = enrich_clusters_with_threat(clusters)

    baseline_decision = allocate_baseline(threat_clusters)
    raw_aegisgrid_decision = allocate_aegisgrid(threat_clusters)
    aegisgrid_decision = stabilize_assignments(
        raw_aegisgrid_decision,
        threat_clusters,
        DECISION_STATE
    )

    decision_explanations = generate_decision_explanations(
        threat_clusters,
        aegisgrid_decision
    )

    evaluation = evaluate_strategies(
        threat_clusters,
        baseline_decision,
        aegisgrid_decision
    )

    state_payload = {
        "true_drones": drones,
        "detections": detections,
        "tracks": tracks,
        "clusters": threat_clusters,
        "evaluation": evaluation,
    }
    
    mission_summary = generate_mission_summary(state_payload)

    report = build_report(
        drones=drones,
        detections=detections,
        clusters=threat_clusters,
        evaluation=evaluation,
        aegisgrid_decision=aegisgrid_decision
    )

    state_payload["report"] = report
    after_action_report = generate_after_action_report(state_payload)

    state_response = {
        "scenario": current_scenario,
        "scenario_type": current_scenario,
        "true_drones": drones,
        "detections": detections,
        "tracks": tracks,
        "clusters": threat_clusters,
        "baseline_decision": baseline_decision,
        "raw_aegisgrid_decision": raw_aegisgrid_decision,
        "aegisgrid_decision": aegisgrid_decision,
        "ai_insights": {
            "decision_explanations": decision_explanations,
            "mission_summary": mission_summary,
            "trust_status": "deterministic_validated",
            "after_action_report": after_action_report
        },
        "evaluation": evaluation,
        "report": report
    }

    global LATEST_STATE
    LATEST_STATE = state_response
    return state_response

@app.post("/ai/after-action")
def ai_after_action():
    state = get_state()

    deterministic_report = state["ai_insights"]["after_action_report"]

    ai_report = call_ai_after_action_agent(deterministic_report)

    if ai_report:
        return {
            "message": "AI after-action report generated",
            "report": ai_report,
            "trust_status": "ai_generated_validated"
        }

    return {
        "message": "Deterministic after-action report returned",
        "report": deterministic_report,
        "trust_status": deterministic_report["trust_status"]
    }

@app.post("/ai/analyze-snapshot")
def analyze_snapshot():
    if not LATEST_STATE:
        state = get_state()
    else:
        state = LATEST_STATE

    top_clusters = sorted(
        state["clusters"],
        key=lambda cluster: cluster.get("threat_score", 0),
        reverse=True
    )[:5]

    snapshot_context = {
        "scenario": state["scenario_type"],
        "drone_count": len(state["true_drones"]),
        "detections": len(state["detections"]),
        "tracks": len(state["tracks"]),
        "cluster_count": len(state["clusters"]),
        "top_clusters": top_clusters,
        "aegisgrid_decision": state["aegisgrid_decision"],
        "evaluation": state["evaluation"],
        "report": state["report"],
    }

    ai_analysis = call_ai_snapshot_agent(snapshot_context)

    if ai_analysis:
        return {
            "message": "AI snapshot analysis generated",
            "analysis": ai_analysis,
            "snapshot_tick": SIMULATION_TICK,
            "trust_status": "ai_generated_validated",
        }

    return {
        "message": "Deterministic snapshot analysis returned",
        "analysis": {
            "title": "Snapshot Analysis",
            "situation": (
                f"AegisGrid is tracking {len(state['clusters'])} clusters "
                f"from {len(state['tracks'])} fused tracks."
            ),
            "primary_risk": (
                f"Top cluster: C{top_clusters[0]['cluster_id']}"
                if top_clusters else "No active cluster risk identified."
            ),
            "recommended_focus": "Continue monitoring highest-threat clusters and resource coverage.",
            "evidence": [
                f"Scenario: {state['scenario_type']}",
                f"Clusters: {len(state['clusters'])}",
                f"Tracks: {len(state['tracks'])}",
                f"Improvement: {state['evaluation'].get('improvement')}%",
            ],
            "limitations": [
                "AI analysis is advisory and based only on the captured snapshot.",
                "Live tracking continues independently of this analysis.",
            ],
            "trust_status": "deterministic_validated",
        },
        "snapshot_tick": SIMULATION_TICK,
        "trust_status": "deterministic_validated",
    }

@app.post("/reset")
def reset_simulation(scenario_type: str = "balanced"):
    global drones, current_scenario, SIMULATION_TICK

    allowed_scenarios = {"balanced", "decoy_heavy", "split_attack"}

    if scenario_type not in allowed_scenarios:
        scenario_type = "balanced"

    current_scenario = scenario_type

    TRACK_HISTORY.clear()
    DECISION_STATE.clear()
    SIMULATION_TICK = 0
    drones = generate_drones(DRONE_COUNT, scenario_type=current_scenario)

    return {
        "message": "simulation reset",
        "scenario": current_scenario,
        "scenario_type": current_scenario
    }


def build_report(drones, detections, clusters, evaluation, aegisgrid_decision):
    true_detections = [
        detection for detection in detections
        if not detection.get("is_false_positive", False)
    ]
    drone_count = len(drones)
    detection_rate = 0

    if drone_count:
        detection_rate = round((len(true_detections) / drone_count) * 100, 2)

    missed_detection_estimate = max(0, drone_count - len(true_detections))
    top_cluster = None

    if clusters:
        top_cluster = max(
            clusters,
            key=lambda cluster: cluster.get("threat_score", 0)
        )

    aegis_metrics = evaluation.get("aegisgrid", {})
    improvement = evaluation.get("improvement", 0)
    critical_clusters = sum(
        1 for cluster in clusters
        if cluster.get("threat_level") == "critical"
    )

    return {
        "detection_rate": detection_rate,
        "missed_detection_estimate": missed_detection_estimate,
        "cluster_count": len(clusters),
        "top_threat_cluster_id": (
            top_cluster.get("cluster_id") if top_cluster else None
        ),
        "verdict": classify_verdict(
            breach_risk=aegis_metrics.get("breach_risk", 100),
            improvement=improvement,
            critical_clusters=critical_clusters,
            assignments_count=len(aegisgrid_decision.get("assignments", []))
        )
    }


def classify_verdict(
    breach_risk,
    improvement,
    critical_clusters,
    assignments_count
):
    if breach_risk <= 35 and improvement >= 20:
        return "BREACH RISK CONTAINED"

    if breach_risk <= 55 and assignments_count >= min(critical_clusters, 1):
        return "PARTIAL SAFETY BREACH"

    return "HIGH RISK - ADDITIONAL RESOURCES REQUIRED"


@app.get("/debug-summary")
def debug_summary():
    state = get_state()

    return {
        "scenario": state["scenario"],
        "drone_count": len(state["true_drones"]),
        "detections": len(state["detections"]),
        "tracks": len(state["tracks"]),
        "clusters": len(state["clusters"]),
        "baseline": state["evaluation"]["baseline"],
        "aegisgrid": state["evaluation"]["aegisgrid"],
        "improvement": state["evaluation"]["improvement"],
        "top_clusters": sorted(
            state["clusters"],
            key=lambda cluster: cluster["threat_score"],
            reverse=True
        )[:3]
    }
