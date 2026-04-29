from app.simulation import generate_drones, update_drones
from app.sensor import generate_sensor_detections
from app.fusion import fuse_detections
from app.clustering import cluster_tracks
from app.threat_engine import enrich_clusters_with_threat
from app.decision import allocate_baseline, allocate_aegisgrid

drones = generate_drones(100)

for step in range(5):
    drones = update_drones(drones)
    detections = generate_sensor_detections(drones)
    tracks = fuse_detections(detections)
    clusters = cluster_tracks(tracks)
    threat_clusters = enrich_clusters_with_threat(clusters)

    baseline_decision = allocate_baseline(threat_clusters)
    aegisgrid_decision = allocate_aegisgrid(threat_clusters)

    print(f"\nSTEP {step + 1}")
    print("CLUSTERS:", len(threat_clusters))

    print("\nBASELINE DECISION:")
    print(baseline_decision)

    print("\nAEGISGRID DECISION:")
    print(aegisgrid_decision)