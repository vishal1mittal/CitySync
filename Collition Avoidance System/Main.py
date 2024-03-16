import math
import pygame
from Index import Graphics, Vehicle, Ultrasonic

MapDimentions = (780, 718)
window_width = 1300
window_height = 650

gfx = Graphics(MapDimentions, "Vehicle.png", "Map.png")

start = (300,300)
vehicle = Vehicle(start, 0.01*3779.52)

sensorRange = 250, math.radians(40)
ultraSonic = Ultrasonic(sensorRange, gfx.map)

dt = 0
lastTime = pygame.time.get_ticks()

running = True
while running:
    # Handle events
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
        elif event.type == pygame.MOUSEBUTTONDOWN:
            # Get the mouse position and print it
            mouse_x, mouse_y = pygame.mouse.get_pos()
            print(f"Mouse clicked at ({mouse_x}, {mouse_y})")

    dt = (pygame.time.get_ticks() - lastTime)/1000
    lastTime = pygame.time.get_ticks()

    gfx.map.blit(gfx.MapImg, (0, 0))

    vehicle.kinematics(dt)
    gfx.drawVehicle(vehicle.x, vehicle.y, vehicle.heading)
    PointCloud = ultraSonic.senseObstacles(vehicle.x, vehicle.y, vehicle.heading)
    vehicle.avoidObsticles(PointCloud, dt)
    gfx.drawSensorData(PointCloud)

    pygame.display.update()
        # pygame.transform.scale(MapImg, ((self.width/1.3 - self.width/5), self.height)), (self.width/5, 0)