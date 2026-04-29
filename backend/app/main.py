from app.simulation import generate_drones, update_drones
from app.sensor import generate_sensor_detections
from app.fusion import fuse_detections

drones = generate_drones(10)

for step in range(5):
    drones = update_drones(drones)
    detections = generate_sensor_detections(drones)
    tracks = fuse_detections(detections)

    print(f"\nSTEP {step + 1}")
    print("DETECTIONS:", len(detections))
    print("FUSED TRACKS:", len(tracks))
    print(tracks[:3])