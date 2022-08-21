import json
import os
import sys
import logging

import numpy as np
from dotenv import load_dotenv
import pandas as pd
from shapely.geometry import Point
import geopandas as gpd
from geopandas import GeoDataFrame
import matplotlib.pyplot as plt
from matplotlib.colors import LinearSegmentedColormap

load_dotenv()

formatter = logging.Formatter(fmt='%(asctime)s %(levelname)-8s %(message)s',
                                  datefmt='%Y-%m-%d %H:%M:%S')

screen_handler = logging.StreamHandler(stream=sys.stdout)
screen_handler.setFormatter(formatter)

# log to stdout
# logging.basicConfig(stream=sys.stdout, level=logging.INFO)
logger = logging.getLogger()

logger.setLevel(logging.INFO)
logger.addHandler(screen_handler)


class GeoPlot:

    def __init__(self) -> None:

        self.grid2D = {
            "j0": 580147.91,
            "k0": 3321376.71,
            "numJ": 3764,
            "numK": 2698,
            "deltaJ": 2.0,
            "deltaK": 2.0
        }

    def plot_img(self):

        df = pd.read_csv("muids_coords.csv", delimiter=',',
                         skiprows=0, low_memory=False)

        geometry = [Point(xy) for xy in zip(df['lat'], df['lng'])]
        gdf = GeoDataFrame(df, geometry=geometry)

        gdf.set_crs('epsg:3857')

        # gdf.to_file('flooding.gpkg', driver='GPKG', layer='name')
        gdf.to_file('flooding.shp')

        # # this is a simple map that goes with geopandas
        # world = gpd.read_file(gpd.datasets.get_path('naturalearth_lowres'))
        # gdf.plot(ax=world.plot(figsize=(10, 6)),
        #          marker='o', color='red', markersize=15)

    def shp_img(self):

        with open(os.path.join('./', 'flooding1660064400.json')) as f:
            flooding_num = json.load(f)

            flooding_num = np.array(flooding_num['data'][0])

        logger.info("load json file {}".format(str(flooding_num.shape)))

        c = ['#00000000', '#0000ff80', '#64aaff80', '#00ff0080',
             '#55ff0080', '#aaff0080', '#ffff0080', '#ff000080']
        v = [0.00, 0.01, 0.02, 0.03, 0.04, 0.05, 0.06, 1.0]

        cmap = LinearSegmentedColormap.from_list(
            'water_level', list(zip(v, c)), N=256)

        plt.figure(
            figsize=(self.grid2D['numJ'] / 500, self.grid2D['numK'] / 500))

        plt.tight_layout()

        plt.axis('off')

        logger.info("start loading shp file")

        grid = gpd.read_file(os.path.join('./', 'flooding.shp'))
        # grid = gpd.read_file(os.path.join('./', 'flooding.gpkg'))

        logger.info("finish loading shp file {}".format(str(grid.shape)))

        # Visualize the travel times into 9 classes using "Quantiles" classification scheme
        grid.plot(column=flooding_num, cmap=cmap, transparent=True,
                  interpolation='none', vmin=0, vmax=1.5)

        # # logger.info(grid)

        outfp = "flooding1660064400.png"
        plt.savefig(outfp, dpi=300)


if __name__ == "__main__":

    gp = GeoPlot()

    gp.shp_img()
