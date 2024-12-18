import xmltodict
import logging

import os
import json
import pandas as pd
import geopandas as gpd
import numpy as np
import pywaterml.waterML as pwml
import shapely.speedups

from .model import (
    Groups,
    HydroServer_Individual,
    Hydroserver_Individual_Cuahsi,
    Hydroserver_Individual_Sensor,
)


from tethys_sdk.permissions import has_permission
from tethys_sdk.routing import controller

from .auxiliary import GetSites_WHOS
from .endpoints import available_regions_2, available_variables_2

from suds.client import Client  # For parsing WaterML/XML
from urllib.parse import unquote
from django.http import JsonResponse
from .app import App

# from shapely.geometry import Point, Polygon
Persistent_Store_Name = "catalog_db"

logging.getLogger("pywaterml.waterML").setLevel(logging.CRITICAL)
logging.getLogger("pywaterml.auxiliaryMod").setLevel(logging.CRITICAL)



# @controller(name="available-services", url="available-services/")
@controller
def get_catalog_views_list(request):
    url_catalog = request.POST.get("url")
    hs_services = {}
    url_catalog = unquote(url_catalog)
    if url_catalog:
        try:
            url_catalog2 = url_catalog + "?WSDL"
            water = pwml.WaterMLOperations(url=url_catalog2)
            hs_services["services"] = water.AvailableServices()["available"]

        except Exception as e:
            print(e)
            hs_services["services"] = []
    return JsonResponse(hs_services)