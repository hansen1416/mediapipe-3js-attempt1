import numpy as np
from opensimplex import OpenSimplex

"""
This script generates a 2D array of values representing the height map of the terrain, 
and then converts it to a mesh by generating vertices, uv, and normals. 
The vertices, uv, and normals are then returned as numpy arrays, along with the triangles that connect them to form the mesh

Note that this is just one way to generate an undulated landscape using code, 
and there are many other techniques and algorithms that can be used depending on the specific requirements of the project.
"""

def generate_terrain(width, height, scale, height_scale):
    terrain = np.zeros((height, width))

    # Create OpenSimplex object with random seed
    seed = np.random.randint(0, 100)
    noise = OpenSimplex(seed)

    # Generate terrain height map
    for y in range(height):
        for x in range(width):
            x_coord = x / width * scale
            y_coord = y / height * scale
            height_value = noise.noise2d(x_coord, y_coord) * height_scale
            terrain[y][x] = height_value

    # Generate vertices, uv, and normals
    vertices = []
    uv = []
    normals = []

    for y in range(height):
        for x in range(width):
            vertices.append([x, terrain[y][x], y])
            uv.append([x / width, y / height])

            if x < width - 1 and y < height - 1:
                # Calculate normals
                normal = np.cross(vertices[y * width + x + 1] - vertices[y * width + x], vertices[(y + 1) * width + x] - vertices[y * width + x])
                normal /= np.linalg.norm(normal)

                normals.append(normal)
                normals.append(normal)
                normals.append(normal)

    # Convert lists to numpy arrays
    vertices = np.array(vertices)
    uv = np.array(uv)
    normals = np.array(normals)

    # Generate triangles
    triangles = []
    for y in range(height - 1):
        for x in range(width - 1):
            index = y * width + x
            triangles.append(index)
            triangles.append(index + width)
            triangles.append(index + width + 1)

            triangles.append(index)
            triangles.append(index + width + 1)
            triangles.append(index + 1)

    # Return mesh data
    return vertices, uv, normals, triangles