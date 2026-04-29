from app.simulation import generate_drones, update_drones
from app.sensor import generate_sensor_detections
from app.fusion import fuse_detections
from app.clustering import cluster_tracks

drones = generate_drones(100)

for step in range(5):
    drones = update_drones(drones)
    detections = generate_sensor_detections(drones)
    tracks = fuse_detections(detections)
    clusters = cluster_tracks(tracks)

    print(f"\nSTEP {step + 1}")
    print("TRUE DRONES:", len(drones))
    print("DETECTIONS:", len(detections))
    print("FUSED TRACKS:", len(tracks))
    print("CLUSTERS:", len(clusters))
    print(clusters[:3])