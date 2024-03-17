import math
import pygame
from queue import PriorityQueue
from Index import Graphics, Vehicle, Ultrasonic
import subprocess


MapDimensions = (720, 720)
window_width = 1300
window_height = 650
chat_id = 991558613  # Replace with the desired chat ID

gfx = Graphics(MapDimensions, "road_1.png")  # Load the map image

# Define starting positions, images, and create vehicles
start_positions = [(100, 300), (200, 500), (300, 400), (400, 200), (500, 300), (600, 500),(300, 300), (700, 500), (700, 100), (400, 400), (400, 500), (500, 600)]
vehicle_images = ["Vehicle.png", "Vehicle.png", "Vehicle.png", "Vehicle.png", "Vehicle.png", "Vehicle.png","Vehicle.png", "Vehicle.png", "Vehicle.png", "Vehicle.png", "Vehicle.png", "Vehicle.png"]

vehicles = []
for pos, image in zip(start_positions, vehicle_images):
    vehicle = Vehicle(pos, 0.01 * 3779.52, image)
    vehicles.append(vehicle)

# Create the ultrasonic sensor object
sensorRange = 200, math.radians(30)
ultraSonic = Ultrasonic(sensorRange, gfx.map)

# Initialize time variables for simulation loop
dt = 0
lastTime = pygame.time.get_ticks()

running = True
while running:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
        elif event.type == pygame.MOUSEBUTTONDOWN:
            mouse_x, mouse_y = pygame.mouse.get_pos()
            print(f"Mouse clicked at ({mouse_x}, {mouse_y})")

    dt = (pygame.time.get_ticks() - lastTime) / 1000
    lastTime = pygame.time.get_ticks()

    gfx.map.blit(gfx.MapImg, (0, 0))

    for vehicle in vehicles:
        if(vehicle.x > window_width or vehicle.x < 0 or vehicle.y > window_height or vehicle.y < 0):
            vehicles.remove(vehicle)
            break
        vehicle.kinematics(dt)
        for other_vehicle in vehicles:
            if vehicle != other_vehicle:  # Make sure not to check a vehicle with itself
                if vehicle.check_collision(other_vehicle):
                    # Assuming vehicle.x, vehicle.y, other_vehicle.x, and other_vehicle.y are float values
                    message = f"There was a collision at the following coordinates: x: {vehicle.x:.2f} y: {vehicle.y:.2f} Of vehicles: {vehicle.Id} (Mobile No. {vehicle.MobNo}) and {other_vehicle.Id} (Mobile No. {other_vehicle.MobNo}). You are being notified because you are the owner of one of the vehicle."

                    vehicles.remove(vehicle)
                    vehicles.remove(other_vehicle)

                    subprocess.run(["D:\\Codes\\SkyDock\\XXNetwork\\XXNetwork.exe", str(chat_id), message])
                    print("collision")
                    # You might want to add more sophisticated collision response here
        gfx.drawVehicle(vehicle.x, vehicle.y, vehicle.heading, vehicle.image)  # Pass image to drawVehicle
        pointCloud = ultraSonic.senseObstacles(vehicle.x, vehicle.y, vehicle.heading)
        vehicle.avoidObstacles(pointCloud, dt, vehicles)
        gfx.drawSensorData(pointCloud)

    pygame.display.update()