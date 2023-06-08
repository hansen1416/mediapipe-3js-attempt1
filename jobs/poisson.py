import numpy as np
from scipy.spatial import cKDTree

"""
This script generates a set of points that are randomly distributed across a region, 
but are spaced apart by a minimum distance. 
The resulting points can be used as the locations for NPCs or objects on the landscape. 
The script also calculates the normals for each point, which can be useful for orienting the NPCs or objects

Note that this is just one way to generate random NPCs or objects on a landscape, 
and there are many other techniques and algorithms that can be used depending on the specific requirements of the project.
"""

def poisson_disk_sampling(width, height, radius, num_samples):
    # Initialize grid and active list
    cell_size = radius / np.sqrt(2)
    grid_width = int(np.ceil(width / cell_size))
    grid_height = int(np.ceil(height / cell_size))
    grid = np.zeros((grid_height, grid_width), dtype=np.int32)
    active_list = []

    # Generate first sample
    x = np.random.uniform(0, width)
    y = np.random.uniform(0, height)
    grid_y, grid_x = int(y // cell_size), int(x // cell_size)
    grid[grid_y][grid_x] = 1
    active_list.append((x, y))

    # Generate additional samples
    while len(active_list) > 0 and len(active_list) < num_samples:
        # Choose random active point
        index = np.random.randint(0, len(active_list))
        point = active_list[index]

        # Generate new points around active point
        for i in range(30):
            angle = np.random.uniform(0, 2 * np.pi)
            distance = np.random.uniform(radius, 2 * radius)
            new_x = point[0] + distance * np.cos(angle)
            new_y = point[1] + distance * np.sin(angle)

            # Check if new point is within bounds and not too close to existing points
            if new_x >= 0 and new_x < width and new_y >= 0 and new_y < height:
                grid_y, grid_x = int(new_y // cell_size), int(new_x // cell_size)
                neighbors = grid[max(0, grid_y - 2):min(grid_height, grid_y + 3), max(0, grid_x - 2):min(grid_width, grid_x + 3)]
                if np.sum(neighbors) == 0:
                    active_list.append((new_x, new_y))
                    grid[grid_y][grid_x] = 1

    # Convert active list to numpy array
    samples = np.array(active_list)

    # Use k-d tree to find nearest neighbors for each sample
    tree = cKDTree(samples)
    distances, indices = tree.query(samples, k=2)

    # Calculate normals for each sample
    normals = []
    for i in range(len(samples)):
        neighbor_indices = indices[i][1:]
        neighbors = samples[neighbor_indices] - samples[i]
        normal = np.array([np.mean(neighbors[:, 0]), np.mean(neighbors[:, 1])])
        normal /= np.linalg.norm(normal)
        normals.append(normal)

    normals = np.array(normals)

    # Return samples and normals
    return samples, normals