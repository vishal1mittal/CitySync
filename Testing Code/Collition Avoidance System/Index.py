import pygame
import numpy as np
import math

def distance(point1, point2):
    point1 = np.array(point1)
    point2 = np.array(point2)
    return np.linalg.norm(point1-point2)

class Vehicle:
    def __init__(self, startpos, width):
        self.m2p = 3779.52
        self.width = width

        self.x = startpos[0]
        self.y = startpos[1]
        self.heading = 0

        self.vl = 0.01*self.m2p
        self.vr = 0.01*self.m2p
        
        self.maxspeed = 0.02*self.m2p
        self.minspeed = 0.01*self.m2p

        self.minObsDistance = 85
        self.countDown = 5

    def avoidObsticles(self, pointCloud, dt):
        closestObj = None
        dist = np.inf

        if(len(pointCloud) > 1):
            for point in pointCloud:
                if dist > distance([self.x, self.y], point):
                    dist = distance([self.x, self.y], point)
                    closestObj = (point, dist)

            if(closestObj[1] < self.minObsDistance and self.countDown > 0):
                self.countDown -= dt
                self.moveBackward()
            else:
                self.countDown = 5
                self.moveForward()

    def moveForward(self):
        self.vr = self.minspeed
        self.vl = self.minspeed

    def moveBackward(self):
        self.vr = -self.minspeed
        self.vl = -self.minspeed/2

    def kinematics(self, dt):
        self.x += ((self.vl + self.vr)/2) * math.cos(self.heading)*dt
        self.y -= ((self.vl + self.vr)/2) * math.sin(self.heading)*dt
        self.heading += ((self.vr - self.vl)/self.width*dt)

        if(self.heading>2*math.pi or self.heading<-2*math.pi):
            self.heading = 0

        self.vr = max(min(self.maxspeed, self.vr), self.minspeed)
        self.vl = max(min(self.maxspeed, self.vl), self.minspeed)

class Graphics:
    def __init__(self, dimentions, VehicleImg, MapImg):
        pygame.init()
        self.black = (0, 0, 0)
        self.white = (255, 255, 255)
        self.green = (0, 255, 0)
        self.blue = (0, 0, 255)
        self.red = (255, 0, 0)
        self.yellow = (255, 255, 0)
        
        self.vehicle = pygame.image.load(VehicleImg)
        self.MapImg = pygame.image.load(MapImg)

        self.width, self.height = dimentions

        pygame.display.set_caption("Obsticle Avoidance")
        self.map = pygame.display.set_mode((self.width, self.height))
        self.map.blit(self.MapImg, (0,0))

    def drawVehicle(self, x, y, heading):
        rotated = pygame.transform.rotozoom(self.vehicle, math.degrees(heading), 1)
        rect = rotated.get_rect(center=(x, y))
        self.map.blit(rotated, rect)
    
    def drawSensorData(self, pointCloud):
        for point in pointCloud:
            pygame.draw.circle(self.map, self.red, point, 3, 0)

class Ultrasonic:
    def __init__(self, sensorRange, map):
        self.sensorRange = sensorRange
        self.mapWidth, self.mapHeight = map.get_size()
        self.map = map

    def senseObstacles(self, x, y, heading):
        obstacles = []
        x1, y1 = x, y
        startAngle = heading - self.sensorRange[1]
        finishAngle = heading + self.sensorRange[1]
        for angle in np.linspace(startAngle, finishAngle, 10, False):
            x2 = x1 + self.sensorRange[0] * math.cos(angle)
            y2 = y1 - self.sensorRange[0] * math.sin(angle)

            for i in range(0, 100):
                u = i/60
                x = int(x2 *u + x1 * (1-u))
                y = int(y2 *u + y1 * (1-u))

                if(0 < x < self.mapWidth and 0 < y < self.mapHeight):
                    color = self.map.get_at((x, y))
                    self.map.set_at((x, y), (0, 208, 255))
                    if(color[0], color[1], color[2]) == (0, 0, 0):
                        obstacles.append([x, y])
                        break
        return obstacles
    