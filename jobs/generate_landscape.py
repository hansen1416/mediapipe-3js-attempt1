import numpy as np
from noise import pnoise2

"""
This script generates a heightmap using Perlin noise and then creates a mesh of triangles based on the heightmap. 
You can adjust the parameters like width, height, scale, octaves, persistence, lacunarity, 
and triangle_size to change the appearance of the landscape.

The vertices and triangles variables contain the generated vertices and triangles, respectively. 
You can use these to render the landscape in a 3D graphics library like OpenGL, DirectX, 
or a game engine like Unity or Unreal Engine.
"""

def generate_heightmap(width, height, scale, octaves, persistence, lacunarity):
    heightmap = np.zeros((width, height))

    for i in range(width):
        for j in range(height):
            heightmap[i][j] = pnoise2(i / scale, j / scale, octaves, persistence, lacunarity)

    return heightmap

def generate_terrain_mesh(heightmap, width, height, triangle_size):
    vertices = []
    triangles = []

    for i in range(width - 1):
        for j in range(height - 1):
            x, y = i * triangle_size, j * triangle_size
            z1, z2, z3, z4 = heightmap[i][j], heightmap[i+1][j], heightmap[i][j+1], heightmap[i+1][j+1]

            # Generate vertices
            v1 = (x, y, z1)
            v2 = (x + triangle_size, y, z2)
            v3 = (x, y + triangle_size, z3)
            v4 = (x + triangle_size, y + triangle_size, z4)

            # Generate triangles
            t1 = (v1, v2, v3)
            t2 = (v2, v4, v3)

            vertices.extend([v1, v2, v3, v4])
            triangles.extend([t1, t2])

    return vertices, triangles

width, height = 100, 100
scale = 20.0
octaves = 6
persistence = 0.5
lacunarity = 2.0
triangle_size = 1

heightmap = generate_heightmap(width, height, scale, octaves, persistence, lacunarity)
vertices, triangles = generate_terrain_mesh(heightmap, width, height, triangle_size)

print("Vertices:", vertices)
print("Triangles:", triangles)