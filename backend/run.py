import json
import os
import sys
import logging
import pyproj

import numpy as np
import pandas as pd
from pyproj import CRS, Transformer
from collections import defaultdict
import concurrent.futures
from requests_futures.sessions import FuturesSession
from dhi_apis import DHIApis
from geoplot import GeoPlot

# log to stdout
logging.basicConfig(stream=sys.stdout, level=logging.INFO)
logger = logging.getLogger()


class DHIProjTrans():
    """Transfer DHI's projection coordinates to epsg 4326 (wgs84) latitude and longitude
    """

    def __init__(self) -> None:

        self.spatial_reference, self.j0, self.k0, self.dj, self.dk = self._get_spatial_info()

        crs_CGCS2000 = pyproj.CRS.from_wkt(self.spatial_reference)
        crs_WGS84 = pyproj.CRS.from_epsg(4326)

        self.transformer = pyproj.Transformer.from_crs(crs_CGCS2000, crs_WGS84)

    def _get_spatial_info(self):
        """get geo information for the DHI coordinates

        Note:
            SPATIAL_REFERENCE: is for epsg 4549
            j0, k0: the stating point of the projection coords
        """

        # todo, save it to db for each 'tenantId'
        SPATIAL_REFERENCE = 'PROJCS["CGCS2000 / 3-degree Gauss-Kruger CM 120E",GEOGCS["China Geodetic Coordinate System 2000",DATUM["China_2000",SPHEROID["CGCS2000",6378137,298.257222101,AUTHORITY["EPSG","1024"]],AUTHORITY["EPSG","1043"]],PRIMEM["Greenwich",0,AUTHORITY["EPSG","8901"]],UNIT["degree",0.0174532925199433,AUTHORITY["EPSG","9122"]],AUTHORITY["EPSG","4490"]],PROJECTION["Transverse_Mercator"],PARAMETER["latitude_of_origin",0],PARAMETER["central_meridian",120],PARAMETER["scale_factor",1],PARAMETER["false_easting",500000],PARAMETER["false_northing",0],UNIT["metre",1,AUTHORITY["EPSG","9001"]],AUTHORITY["EPSG","4549"]]'
        # todo, get its info from db for each 'scenarioId'
        j0, k0 = 580147.91, 3321376.71
        deltaJ, deltaK = 2.0, 2.0

        return SPATIAL_REFERENCE, j0, k0, deltaJ, deltaK

    def trans_get_grid_center(self, j: int, k: int):
        """Get the the center lat,lng of a grid center

        Args:
            j (int): x-axis value of the grid
            k (int): y-axis value of the grid

        Return:
            (lat, lng) in float
        """

        return self.transformer.transform(self.j0 + int(j) * self.dj - 1, self.k0 + int(k) * self.dk - 1)


def muids_to_coord():

    with open(os.path.join('./', 'muids.json'), 'r') as f:
        muids = json.load(f)

    proj = DHIProjTrans()
    lats, lngs = [], []

    # logger.info(muids[0])

    for muid in muids:
        grid = list(map(int, muid.split(',')))

        lat, lng = proj.trans_get_grid_center(grid[0], grid[1])

        lats.append(lat)
        lngs.append(lng)

    df = pd.DataFrame(columns=['muids', 'lat', 'lng'])

    df['muids'] = muids
    df['lat'] = lats
    df['lng'] = lngs

    df.to_csv('muids_coords.csv')


def get_corners():
    return {
        "j0": 580147.91,
        "k0": 3321376.71,
        "numJ": 3764,
        "numK": 2698,
        "deltaJ": 2.0,
        "deltaK": 2.0
    }


if __name__ == "__main__":

    scenario_id = "a8569e1b-03c9-4539-8d48-58f6d4f81670"

    proj = DHIProjTrans()

    c1 = proj.trans_get_grid_center(0, 0)
    c2 = proj.trans_get_grid_center(3764, 2698)

    print(c1, c2)

    # dhi = DHIApis(scenario_id)

    # # dhi.get_muids()
    # dhi.json_to_png()

    # muids_to_coord()

    # gp = GeoPlot()

    # gp.plot_img()
