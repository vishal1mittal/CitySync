import pygame
import numpy as np
import math
import random

def distance(point1, point2):
    point1 = np.array(point1)
    point2 = np.array(point2)
    return np.linalg.norm(point1-point2)

class Vehicle:
    def __init__(self, startpos, width, image):
        self.Id = "DL" + str(random.randint(10, 99)) + "XX" + str(random.randint(1000, 9999))
        self.MobNo = random.randint(1000000000, 9999999999)
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

        self.image = image

    def avoidObstacles(self, pointCloud, dt, otherVehicles):
        closestObj = None
        dist = np.inf

        if len(pointCloud) > 1:
            for point in pointCloud:
                if dist > distance([self.x, self.y], point):
                    dist = distance([self.x, self.y], point)
                    closestObj = (point, dist)

            if closestObj[1] < self.minObsDistance and self.countDown > 0:
                self.countDown -= dt
                self.moveBackward()
            else:
                self.countDown = 5
                self.moveForward()
        else:
            for vehicle in otherVehicles:
                if vehicle != self:
                    vehiclePos = [vehicle.x, vehicle.y]
                    if dist > distance([self.x, self.y], vehiclePos):
                        dist = distance([self.x, self.y], vehiclePos)
                        closestObj = (vehiclePos, dist)

            if closestObj and closestObj[1] < self.minObsDistance and self.countDown > 0:
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

    def check_collision(self, other):
        dist = math.hypot(other.x - self.x, other.y - self.y)
        collision_radius = self.width / 2
        other_collision_radius = other.width / 2
        return dist < (collision_radius + other_collision_radius)
    
class Graphics:
    def __init__(self, dimensions, map_image):
        pygame.init()
        self.black = (0, 0, 0)
        self.white = (255, 255, 255)
        self.green = (0, 255, 0)
        self.blue = (0, 0, 255)
        self.red = (255, 0, 0)
        self.yellow = (255, 255, 0)
        
        self.MapImg = pygame.image.load(map_image)

        self.width, self.height = dimensions

        pygame.display.set_caption("Obstacle Avoidance")
        self.map = pygame.display.set_mode((self.width, self.height))
        self.map.blit(self.MapImg, (0, 0))

    def drawVehicle(self, x, y, heading, image):  # Add 'image' parameter
        vehicle_image = pygame.image.load(image)
        rotated = pygame.transform.rotozoom(vehicle_image, math.degrees(heading), 1)
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
                    if((color[0], color[1], color[2]) == (0, 0, 0) or (color[0], color[1], color[2]) == (254,136,2)):
                        if distance([x, y], [x1, y1]) > 30:
                            obstacles.append([x, y])
                            break
        return obstacles
    
class Spot:
	def __init__(self, row, col, width, total_rows):
		self.row = row
		self.col = col
		self.x = row * width
		self.y = col * width
		self.color = WHITE
		self.neighbors = []
		self.width = width
		self.total_rows = total_rows

	def get_pos(self):
		return self.row, self.col

	def is_closed(self):
		return self.color == RED

	def is_open(self):
		return self.color == GREEN

	def is_barrier(self):
		return self.color == BLACK

	def is_start(self):
		return self.color == ORANGE

	def is_end(self):
		return self.color == TURQUOISE

	def reset(self):
		self.color = WHITE

	def make_start(self):
		self.color = ORANGE

	def make_closed(self):
		self.color = RED

	def make_open(self):
		self.color = GREEN

	def make_barrier(self):
		self.color = BLACK

	def make_end(self):
		self.color = TURQUOISE

	def make_path(self):
		self.color = PURPLE

	def draw(self, win):
		pygame.draw.rect(win, self.color, (self.x, self.y, self.width, self.width))

	def update_neighbors(self, grid):
		self.neighbors = []
		if self.row < self.total_rows - 1 and not grid[self.row + 1][self.col].is_barrier(): # DOWN
			self.neighbors.append(grid[self.row + 1][self.col])

		if self.row > 0 and not grid[self.row - 1][self.col].is_barrier(): # UP
			self.neighbors.append(grid[self.row - 1][self.col])

		if self.col < self.total_rows - 1 and not grid[self.row][self.col + 1].is_barrier(): # RIGHT
			self.neighbors.append(grid[self.row][self.col + 1])

		if self.col > 0 and not grid[self.row][self.col - 1].is_barrier(): # LEFT
			self.neighbors.append(grid[self.row][self.col - 1])

	def __lt__(self, other):
		return False


def h(p1, p2):
	x1, y1 = p1
	x2, y2 = p2
	return abs(x1 - x2) + abs(y1 - y2)


def reconstruct_path(came_from, current, draw):
	while current in came_from:
		current = came_from[current]
		current.make_path()
		draw()


def algorithm(draw, grid, start, end):
	count = 0
	open_set = PriorityQueue()
	open_set.put((0, count, start))
	came_from = {}
	g_score = {spot: float("inf") for row in grid for spot in row}
	g_score[start] = 0
	f_score = {spot: float("inf") for row in grid for spot in row}
	f_score[start] = h(start.get_pos(), end.get_pos())

	open_set_hash = {start}

	while not open_set.empty():
		for event in pygame.event.get():
			if event.type == pygame.QUIT:
				pygame.quit()

		current = open_set.get()[2]
		open_set_hash.remove(current)

		if current == end:
			reconstruct_path(came_from, end, draw)
			end.make_end()
			return True

		for neighbor in current.neighbors:
			temp_g_score = g_score[current] + 1

			if temp_g_score < g_score[neighbor]:
				came_from[neighbor] = current
				g_score[neighbor] = temp_g_score
				f_score[neighbor] = temp_g_score + h(neighbor.get_pos(), end.get_pos())
				if neighbor not in open_set_hash:
					count += 1
					open_set.put((f_score[neighbor], count, neighbor))
					open_set_hash.add(neighbor)
					neighbor.make_open()

		draw()

		if current != start:
			current.make_closed()

	return False


def make_grid(rows, width):
	grid = []
	gap = width // rows
	for i in range(rows):
		grid.append([])
		for j in range(rows):
			spot = Spot(i, j, gap, rows)
			grid[i].append(spot)

	return grid


def draw_grid(win, rows, width):
	gap = width // rows
	for i in range(rows):
		pygame.draw.line(win, GREY, (0, i * gap), (width, i * gap))
		for j in range(rows):
			pygame.draw.line(win, GREY, (j * gap, 0), (j * gap, width))


def draw(win, grid, rows, width):
	win.fill(WHITE)

	for row in grid:
		for spot in row:
			spot.draw(win)

	draw_grid(win, rows, width)
	pygame.display.update()


def get_clicked_pos(pos, rows, width):
	gap = width // rows
	y, x = pos

	row = y // gap
	col = x // gap

	return row, col

