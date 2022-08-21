from datetime import datetime
from genericpath import isfile
import json
import os
import re
import sys
import logging
import base64
from urllib.parse import urlparse, parse_qs

import utm
import redis
import requests
from dotenv import load_dotenv
import concurrent.futures
from requests_futures.sessions import FuturesSession
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from matplotlib.colors import LinearSegmentedColormap

load_dotenv()

# log to stdout
logging.basicConfig(stream=sys.stdout, level=logging.INFO)
logger = logging.getLogger()

API_BASE_URL = os.getenv('DHI_API_BASE_URL')
USER_NAME = os.getenv('DHI_USER_NAME')
PASSWORD = os.getenv('DHI_PASSWORD')
TANANT_ID = os.getenv('DHI_TANANT_ID')

# MUP_NAME = "YSmodel.mupp"
# MODEL_TIME_STEP = -1 # seconds

GET_ACCESS_TOKEN_URL = "identity-service/connect/token"
# Model Configuration Service
UPLOAD_MODEL_TEMPLATE_URL = "urban-flooding-model-configuration-service/api/v1/model-configuration/template/upload-model-template"
CREATE_MODEL_TEMPLATE_URL = "urban-flooding-model-configuration-service/api/v1/model-configuration/template/create-model-template"
CREATE_TEMPLATE_SCENARIO_URL = "urban-flooding-model-configuration-service/api/v1/model-configuration/scenario/create-template-scenario"
INIT_DEVICE_URL = "urban-flooding-model-configuration-service/api/v1/model-configuration/iot/init-device"
GET_BOUNDARY_CONFIG_LIST_URL = "urban-flooding-model-configuration-service/api/v1/model-configuration/boundary-config/list"
UPDATE_BOUNDAY_CONFIG_URL = "urban-flooding-model-configuration-service/api/v1/model-configuration/boundary-config/update"
GET_AUTOFORECAST_LIST_URL = "urban-flooding-model-configuration-service/api/v1/model-configuration/autoforecast/list"
UPLOAD_FILE_URL = "urban-flooding-model-configuration-service/api/v1/model-configuration/file-manager/upload-file"
MERGE_FILE_URL = "urban-flooding-model-configuration-service/api/v1/model-configuration/file-manager/merge-file"
ENABLE_TEMPLATE_SCENARIO_URL = "urban-flooding-model-configuration-service/api/v1/model-configuration/scenario/enable-template-scenario"
SENSITIVE_POINT_LIST_URL = "urban-flooding-model-configuration-service/api/v1/model-configuration/sensitive-point/list"
# Iot Service
# Device
GET_DEVICE_DETAIL_URL = "iot-service/api/v1/iot/device-details"
GET_DEVICE_LIST_URL = "iot-service/api/v1/iot/device-list"
DELETE_DEVICE_URL = "iot-service/api/v1/iot/delete-devices"
# Asset
CREATE_ASSET_RELATIONSHIP_URL = "iot-service/api/v1/iot/asset-relations"
GET_ASSET_LIST_URL = "iot-service/api/v1/iot/asset-list"
# Telemetry Data
SAVE_TELEMETRY_DATA_URL = "iot-service/api/v1/iot/save-telemetry-data"
SAVE_TELEMETRY_DATA_BATCH_URL = "iot-service/api/v1/iot/save-telemetry-data-batch"
# Result Analysis Service
# RainLog
GET_RAIN_LIST_URL = "urban-flooding-result-service/api/v1/result/rain/list"
GET_RAIN_URL = 'urban-flooding-result-service/api/v1/result/rain/get'
# Scenario
GET_SCENARIO_TIME_INFO_URL = "urban-flooding-result-service/api/v1/result/scenario/time-info"
# 2D Result
GET_2D_BY_RANGE_TIME_URL = "urban-flooding-result-service/api/v1/result/2d/by-range-time"
GET_2D_STATIC_URL = "urban-flooding-result-service/api/v1/result/2d/static"
GET_2D_MUIDS_URL = "urban-flooding-result-service/api/v1/result/2d/muids"
GET_2D_BY_TIME_URL = "urban-flooding-result-service/api/v1/result/2d/by-time"
GET_2D_TIMESERIES_URL = "urban-flooding-result-service/api/v1/result/2d/timeseries"
# Network Result
GET_RESULT_NETWORK_STATISTICS_URL = "urban-flooding-result-service/api/v1/result/network/statistics"
GET_RESULT_NETWORK_DYNAMIC_URL = "urban-flooding-result-service/api/v1/result/network/dynamic"
GET_RESULT_NETWORK_NODE_DYNAMIC_URL = "urban-flooding-result-service/api/v1/result/network/node-dynamic"
GET_RESULT_NETWORK_STATIC_URL = "urban-flooding-result-service/api/v1/result/network/static"
GET_RESULT_NETWORK_NODE_STATIC_URL = "urban-flooding-result-service/api/v1/result/network/node-static"
GET_RESULT_NETWORK_TIMESERIES_URL = "urban-flooding-result-service/api/v1/result/network/timeseries"
GET_RESULT_NETWORK_NODE_TIMESERIES_URL = "urban-flooding-result-service/api/v1/result/network/node-timeseries"
GET_RESULT_NETWORK_PUMP_STATISTICS_URL = "urban-flooding-result-service/api/v1/result/network/pump-statistics"
GET_RESULT_NETWORK_VALVE_STATISTICS_URL = "urban-flooding-result-service/api/v1/result/network/valve-statistics"
GET_RESULT_NETWORK_PUMP_TIMESERIES_URL = "urban-flooding-result-service/api/v1/result/network/pump-timeseries"
GET_RESULT_NETWORK_PROFILE_TIMESERIES_URL = "urban-flooding-result-service/api/v1/result/network/profile-timeseries"
# River Result
GET_RESULT_RIVER_STATIC_URL = "urban-flooding-result-service/api/v1/result/river/static"
GET_RESULT_RIVER_DYNAMIC_URL = "urban-flooding-result-service/api/v1/result/river/dynamic"
GET_RESULT_RIVER_TIMESERIES_URL = "urban-flooding-result-service/api/v1/result/river/timeseries"
GET_RESULT_RIVER_PUMP_STATISTICS_URL = "urban-flooding-result-service/api/v1/result/river/pump-statistics"
GET_RESULT_RIVER_GATE_STATISTICS_URL = "urban-flooding-result-service/api/v1/result/river/gate-statistics"
GET_RESULT_RIVER_PUMP_TIMESERIES_URL = "urban-flooding-result-service/api/v1/result/river/pump-timeseries"
GET_RESULT_RIVER_PROFILE_TIMESERIES_URL = "urban-flooding-result-service/api/v1/result/river/profile-timeseries"
# UrbanFlooding Result
GET_RESULT_URBAN_FLOODING_RISK_URL = "urban-flooding-result-service/api/v1/result/urban-flooding/flooding-risk"
GET_RESULT_URBAN_FLOODING_SENSITIVE_POINTS_STATISTICS_URL = "urban-flooding-result-service/api/v1/result/urban-flooding/sensitive-points-statistics"
GET_RESULT_URBAN_FLOODING_AREA_URL = "urban-flooding-result-service/api/v1/result/urban-flooding/flooding-area"
# Model Information Service(GIS)
GET_GIS_2D_GRID_URL = "urban-flooding-model-gis-service/api/v1/model-information/2d-grid"
GET_GIS_RIVER_URL = "urban-flooding-model-gis-service/api/v1/model-information/river"
GET_GIS_NETWORK_PIPE_URL = "urban-flooding-model-gis-service/api/v1/model-information/network/pipe"
GET_GIS_NETWORK_NODE_URL = "urban-flooding-model-gis-service/api/v1/model-information/network/node"
GET_GIS_NETWORK_CATCHMENTS_URL = "urban-flooding-model-gis-service/api/v1/model-information/network/catchments"
# Scenario Service
GET_LIBRARY_LIST_TYPE_URL = "urban-flooding-scenario-manager-service/api/v1/scenario-manager/library/list/type"
GET_LIBRARY_SCENARIOLIST_URL = "urban-flooding-scenario-manager-service/api/v1/scenario-manager/library/scenariolist"
GET_LIBRARY_LATESTSCENARIO_URL = "urban-flooding-scenario-manager-service/api/v1/scenario-manager/library/latestscenario"
GET_SCENARIO_URL = "urban-flooding-scenario-manager-service/api/v1/scenario-manager/scenario"


class DHIApis:
    """DHI API future requests
    """

    def __init__(self, scenario_id) -> None:

        self.scenario_id = scenario_id

        host = os.getenv("REDIS_HOST")
        port = os.getenv("REDIS_PORT")
        db = os.getenv("REDIS_DB")

        password = os.getenv("REDIS_PASSWORD")
        password = password.encode("ascii")
        password = base64.b64decode(password)
        password = password.decode("ascii")

        self.timeout = 30

        self.redis_db = redis.Redis(
            host=host, port=port, db=db, password=password)
        # self.threadpool_executor = concurrent.futures.ThreadPoolExecutor(max_workers=8)
        self.img_ext = '.png'

        self.grid2D = {
            "j0": 580147.91,
            "k0": 3321376.71,
            "numJ": 3764,
            "numK": 2698,
            "deltaJ": 2.0,
            "deltaK": 2.0
        }

    def __getattr__(self, name):
        return API_BASE_URL + globals()[name]

    @staticmethod
    def _grid_area(self):

        # TODO, get this value from DB
        grid_width = 2.0
        grid_height = 2.0

        return grid_width * grid_height

    def _response_parser(self, response):

        if type(response) != dict or 'data' not in response:

            if 'status' in response and response['status'] == False \
                    and 'message' in response and response['message']:

                logging.info(response['message'])

                logging.info(response)

            if 'status' in response and response['status'] == False \
                    and 'code' in response and response['code'] == 'gateway_forbidden_authorization':

                self.get_access_token(refresh=True)

            return {}

        return response['data']

    def _get_m2dstatic_zset_key(self, type):
        return self.scenario_id + ":m2dstatic:" + str(type)

    def _get_m2ddynamic_bytime_hash_key(self, time_string):
        return self.scenario_id + ":dbytime:" + str(time_string)

    def get_access_token(self, refresh=False):

        redis_key = 'dhi_access_token'

        if refresh or not self.redis_db.exists(redis_key):

            api_url = API_BASE_URL + GET_ACCESS_TOKEN_URL

            logger.info(
                "making request to get access_token from {}".format(api_url))

            payload = {"client_id": "IdentityServer_App", "grant_type": "password",
                       "client_secret": "955q2w3e*", "username": f"{USER_NAME}", "password": f"{PASSWORD}"}
            headers = {
                "Content-Type": "application/x-www-form-urlencoded", "tenantId": f"{TANANT_ID}"}
            response = requests.post(api_url, data=payload, headers=headers)
            if response.status_code == 200:

                body = json.loads(response._content.decode())
                self.redis_db.setex(redis_key, body.get(
                    "expires_in"), body.get("access_token"))

                logger.info("get access_token that expires in {}".format(
                    body.get("expires_in")))

        return self.redis_db.get(redis_key).decode()

    def get_header(self):
        return {"tenantId": f"{TANANT_ID}", "Authorization": 'Bearer {}'.format(self.get_access_token())}

    def request_futures(self, url, payload, callback, marker):

        try:

            # with self.threadpool_executor as executor:
            with concurrent.futures.ThreadPoolExecutor(max_workers=8) as executor:

                session = FuturesSession(executor=executor)

                futures = [session.get(
                    url, headers=self.get_header(), params=payload)]

                for future in concurrent.futures.as_completed(futures, timeout=20):

                    resp = future.result()

                    logger.warning(marker)

                    body = self._response_parser(resp.json())

                    callback(body)

                    resp.close()

        except concurrent.futures._base.TimeoutError as e1:
            logger.info("DHI api timeout in 20s")
        except RuntimeError as e2:
            logger.info(
                "RuntimeError: cannot schedule new futures after interpreter shutdown. " + str(e2))
        # except:
        #     self.threadpool_executor.shutdown(wait=True)
        finally:
            pass
            # executor.shutdown(wait=True)
            # self.threadpool_executor.shutdown(wait=True)

    def get_muids(self):
        # raise RuntimeError("hahahaha")
        # logger.info(response_data)

        # urls = [
        #     self.GET_2D_MUIDS_URL,
        #     # self.GET_2D_BY_TIME_URL,
        #     # self.GET_2D_BY_TIME_URL,
        #     # self.GET_2D_BY_TIME_URL,
        #     # self.GET_2D_BY_TIME_URL,
        # ]
        # payloads = [
        #     {"ScenarioId": self.scenario_id},
        #     # {"ScenarioId": self.scenario_id, 'Time': '2022-08-10 00:00:00'},
        #     # {"ScenarioId": self.scenario_id, 'Time': '2022-08-10 00:05:00'},
        #     # {"ScenarioId": self.scenario_id, 'Time': '2022-08-10 00:10:00'},
        #     # {"ScenarioId": self.scenario_id, 'Time': '2022-08-10 01:00:00'},
        # ]

        json_dir = os.path.join('./', 'jsons')

        urls = []
        payloads = []

        for m in range(2):
            for s in range(60):

                if s < 10:
                    s = '0' + str(s)

                time_string = '2022-08-10 0' + str(m) + ':' + str(s) + ':00'
                timestamp = int(datetime.timestamp(
                    datetime.strptime(time_string, "%Y-%m-%d %H:%M:%S")))

                if os.path.isfile(os.path.join(json_dir, 'flooding' + str(timestamp) + '.json')):
                    print('json file exists for {}, {}'.format(
                        time_string, timestamp))
                else:
                    payloads.append(
                        {"ScenarioId": self.scenario_id,  'Time': time_string})
                    urls.append(self.GET_2D_BY_TIME_URL)

        try:

            # with self.threadpool_executor as executor:
            with concurrent.futures.ThreadPoolExecutor(max_workers=8) as executor:

                session = FuturesSession(executor=executor)

                futures = []

                for i in range(len(urls)):

                    futures.append(session.get(
                        urls[i], headers=self.get_header(), params=payloads[i]))

                    logger.info("Send request to {} with payload {}".format(
                        urls[i], str(payloads[i])))

                for future in concurrent.futures.as_completed(futures, timeout=self.timeout):

                    resp = future.result()

                    logger.info("Get response from {} ".format(resp.url))

                    body = self._response_parser(resp.json())

                    parse_result = urlparse(resp.url)
                    dict_result = parse_qs(parse_result.query)

                    if 'Time' in dict_result:
                        timestamp = datetime.timestamp(datetime.strptime(
                            dict_result['Time'][0], "%Y-%m-%d %H:%M:%S"))
                        filename = "flooding" + str(int(timestamp))
                    else:
                        filename = "muids"
                    with open(os.path.join(json_dir, filename + ".json"), "w") as f:
                        json.dump(body, f)

                        logger.info("Save data to {} ".format(filename))

                    resp.close()

        except concurrent.futures._base.TimeoutError as e1:
            logger.info("DHI api timeout in {}s, {}".format(
                self.timeout, str(e1)))
        except RuntimeError as e2:
            logger.info(
                "RuntimeError: cannot schedule new futures after interpreter shutdown. " + str(e2))
        finally:
            executor.shutdown(wait=False)

    def json_to_png(self):

        json_dir = os.path.join('./', 'jsons')
        img_dir = os.path.join('../', 'GiF', 'src',
                               'frontend', 'public', 'image', 'flooding')

        grid2D = {
            "j0": 580147.91,
            "k0": 3321376.71,
            "numJ": 3764,
            "numK": 2698,
            "deltaJ": 2.0,
            "deltaK": 2.0
        }

        flooding_data = {}

        i = 0

        with open(os.path.join(json_dir, 'muids.json'), 'r') as f:
            muids = json.load(f)
            muids_np = np.array([list(map(int, x.split(','))) for x in muids])

        for filename in os.listdir(json_dir):
            if filename.startswith('flooding'):
                # print(type(filename))

                res = re.search(r'\d+', filename)

                if not res:
                    logger.error("Illegal flooding json")

                timestamp = res.group(0)

                if os.path.isfile(os.path.join(img_dir, 'flooding' + timestamp + self.img_ext)):
                    logger.info(
                        'png existed for timestamp {}'.format(timestamp))
                else:
                    with open(os.path.join(json_dir, filename), 'r') as f:
                        data = json.load(f)
                        flooding_data[res.group(0)] = data['data'][0]

                    i += 1

                    if i >= 10:
                        break

        logger.info("Got {} jsons {}".format(
            len(flooding_data.keys()), str(flooding_data.keys())))
        logger.info("Got {} muids".format(len(muids)))

        heatmaps = {k: np.zeros([grid2D['numK'], grid2D['numJ']], dtype=np.single)
                    for k, _ in flooding_data.items()}

        for timestamp in flooding_data.keys():
            # because the 0 coords from DHI is at bottom left, but the coords for matplot lib is at top
            heatmaps[timestamp][muids_np[:, 1],
                                muids_np[:, 0]] = flooding_data[timestamp]

            logger.info(
                "value assigned to `heatmaps` for timestamp {}".format(timestamp))

        c = ['#00000000', '#0000ff80', '#64aaff80', '#00ff0080',
             '#55ff0080', '#aaff0080', '#ffff0080', '#ff000080']
        v = [0.00, 0.01, 0.02, 0.03, 0.04, 0.05, 0.06, 1.0]

        cmap = LinearSegmentedColormap.from_list(
            'water_level', list(zip(v, c)), N=256)

        for timestamp in flooding_data.keys():
            plt.figure(figsize=(grid2D['numJ'] / 500, grid2D['numK'] / 500))
            plt.axis('off')

            plt.imshow(heatmaps[timestamp], cmap=cmap,
                       interpolation='none', vmin=0, vmax=1.5)

            plt.gca().invert_yaxis()

            image_file = os.path.join(
                img_dir, 'flooding' + timestamp) + self.img_ext

            plt.savefig(image_file, transparent=True, dpi=200)

            logger.info("PNG saved to {}".format(image_file))

    def get_cmap(self):

        c = ['#00000000', '#0000ff80', '#64aaff80', '#00ff0080',
             '#55ff0080', '#aaff0080', '#ffff0080', '#ff000080']
        v = [0.00, 0.01, 0.02, 0.03, 0.04, 0.05, 0.06, 1.0]

        return LinearSegmentedColormap.from_list(
            'water_level', list(zip(v, c)), N=256)

    def latlng_to_xy(self):

        muids_coord = pd.read_csv(os.path.join('./', 'muids_coords.csv'))

        latlng = muids_coord[['lat', 'lng']].values

        # logger.info(latlng[:, 0])
        # logger.info(latlng[:, 1])

        cornerx, cornery = self.get_corners()

        x, y, zone, zone_letter = utm.from_latlon(latlng[:, 0], latlng[:, 1])

        x = np.append(x, cornerx)
        y = np.append(y, cornery)

        # logger.info(x)
        # logger.info(y)

        x = np.subtract(x, np.amin(cornerx[0]))
        y = np.subtract(y, np.amin(cornery[0]))

        # logger.info(x)
        # logger.info(y)

        # return

        with open(os.path.join('./', 'flooding1660064400.json')) as f:
            flooding_num = json.load(f)

            flooding_num = np.array(flooding_num['data'][0])

        flooding_num = np.append(flooding_num, [1.5, 1.5])

        logger.info("load flooding data of size {}".format(len(flooding_num)))

        # plt.figure(figsize=(grid2D['numJ'] / 500, grid2D['numK'] / 500))
        plt.axis('off')

        plt.tight_layout()

        plt.scatter(x, y, s=1, c=flooding_num,
                    cmap=self.get_cmap(), vmin=0, vmax=1.5)

        image_file = 'flooding1660064400.png'

        plt.savefig(image_file, transparent=True, dpi=200)

        logger.info("PNG saved to {}".format(image_file))

    def get_corners(self):

        x, y, zone, zone_letter = utm.from_latlon(np.array([30.008765843320734, 30.056921240670786]),
                                                  np.array([120.83071438951838, 120.9091776437796]))

        logger.info(x)
        logger.info(y)

        return x, y

    def png3857(self):

        muids = np.load('muids_3857.npy')

        # offset j0, k0
        muids[:, 0] -= muids[-2][0]
        muids[:, 1] -= muids[-2][1]

        with open(os.path.join('./', 'flooding1660064400.json')) as f:
            flooding_num = json.load(f)

            flooding_num = np.array(flooding_num['data'][0])

        flooding_num = np.append(flooding_num, [1.5, 1.5])

        logger.info("load flooding data of size {}".format(len(flooding_num)))

        plt.figure(
            figsize=(self.grid2D['numJ'] / 500, self.grid2D['numK'] / 500))
        plt.axis('off')

        plt.tight_layout()

        plt.scatter(muids[:, 0], muids[:, 1], s=1, c=flooding_num, alpha=0.3,
                    cmap=self.get_cmap(), vmin=0, vmax=1.5)

        image_file = 'flooding1660064400.3857.png'

        plt.savefig(image_file, transparent=True, dpi=200)

        logger.info("PNG saved to {}".format(image_file))


if __name__ == "__main__":

    scenario_id = "a8569e1b-03c9-4539-8d48-58f6d4f81670"

    gp = DHIApis(scenario_id)

    gp.png3857()

    # gp.get_corners()
