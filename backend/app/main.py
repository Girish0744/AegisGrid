from app.simulation import generate_drones, update_drones
from app.sensor import generate_sensor_detections

drones = generate_drones(10)
drones = update_drones(drones)

detections = generate_sensor_detections(drones)

print("TRUE DRONES:")
print(drones[:2])

print("\nSENSOR DETECTIONS:")
print(detections[:5])