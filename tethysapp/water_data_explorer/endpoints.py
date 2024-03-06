import logging
import os
import json
import pandas as pd
import geopandas as gpd
import shapely.speedups
import pywaterml.waterML as pwml
from .model import Groups, HydroServer_Individual, Hydroserver_Individual_Cuahsi, Hydroserver_Individual_Sensor

import requests

from tethys_sdk.routing import controller

from .auxiliary import GetSites_WHOS
from django.http import JsonResponse
from .app import WaterDataExplorer as app

Persistent_Store_Name = 'catalog_db'
logging.getLogger("pywaterml.waterML").setLevel(logging.CRITICAL)
logging.getLogger("pywaterml.auxiliaryMod").setLevel(logging.CRITICAL)
# logging.basicConfig(level=logging.CRITICAL)
# logging.getLogger('suds.client').setLevel(logging.DEBUG)


@controller(name='get-download-hs', url='get-download-hs/')
def get_download_hs(request):
    hs_name = request.POST.get('hs_name')
    hs_url = request.POST.get('hs_url')
    variable_hs = request.POST.get('variable_hs')
    site_hs = request.POST.get('site_hs')
    url = ('https://gist.githubusercontent.com/romer8/89c851014afb276b0f20cb61c9c731f6/raw/\
           a0ee55ca83e75f34f26eb94bd52941cc2a2199cd/pywaterml_template.ipynb')
    contents = requests.get(url).text
    # print(len(contents))
    nb = json.loads(contents)

    nb['cells'][1]['source'][0] = f'# {hs_name} \n'
    nb['cells'][5]['source'][0] = f'WOF_URL = "{hs_url}" \n'
    nb['cells'][5]['source'][1] = f'VARIABLE = {variable_hs} \n'
    nb['cells'][5]['source'][2] = f'SITE = {site_hs} \n'

    # convert to notebbok again#

    return JsonResponse(nb)

@controller(name='get-variables-hs', url='get-variables-hs/')
def get_variables_hs(request):
    # import pdb
    # pdb.set_trace()
    list_catalog = {}
    # print("get_variables_hs Function")
    specific_group = request.POST.get('group')
    hs_actual = request.POST.get('hs')
    hs_actual = hs_actual.replace('-', ' ')
    # print("HS", hs_actual)
    SessionMaker = app.get_persistent_store_database(Persistent_Store_Name, as_sessionmaker=True)

    session = SessionMaker()  # Initiate a session
    #hydroservers_group = session.query(Groups).filter(Groups.title == specific_group)[0].hydroserver

    hydroservers_1 = session.query(Groups).filter(Groups.title == specific_group)[0].hydroserver1
    hydroservers_2 = session.query(Groups).filter(Groups.title == specific_group)[0].hydroserver2

    print(hydroservers_1)
    
    for hydroserver in hydroservers_1:
        name = hydroserver.title
        if hs_actual == name:
            # print(hydroservers.url)
            # layer_obj = {}
            # layer_obj["title"] = hydroservers.title
            # layer_obj["url"] = hydroservers.url.strip()
            # print(layer_obj["url"])
            # layer_obj["siteInfo"] = hydroservers.siteinfo
            # client = Client(url = hydroservers.url.strip(), timeout= 500)
            # keywords = client.service.GetVariables('[:]')
            water = pwml.WaterMLOperations(url=hydroserver.url.strip())
            keywords_response = water.GetVariables()['variables']
            keywords = []
            keywords_name = []
            keywords_abbr_unit = []
            key_timeSupport = []
            timeUnitName = []
            for kyword in keywords_response:
                # print(kyword)
                keywords.append(kyword['variableCode'])
                keywords_name.append(kyword['variableName'])
                keywords_abbr_unit.append(kyword['unitAbbreviation'])
                key_timeSupport.append(kyword['timeSupport'])
                timeUnitName.append(kyword['timeUnitAbbreviation'])
            variables_show = keywords
            list_catalog["variables_code"] = variables_show
            list_catalog["variables_name"] = keywords_name
            list_catalog["variables_unit_abr"] = keywords_abbr_unit
            list_catalog["variables_timesupport"] = key_timeSupport
            list_catalog["variables_time_abr"] = timeUnitName
            return JsonResponse({"server_type":"hydroserver1","variables":list_catalog})
            
    
    # import pdb
    # pdb.set_trace()
    for hydroserver in hydroservers_2:
        name = hydroserver.title
        if hs_actual == name:
            url = hydroserver.url
            datastream_url = url + "/api/data/datastreams"
            datastream_with_units_url = url + "/api/sensorthings/v1.1/Datastreams?%24skip=0"
            properties_url = url + "/api/sensorthings/v1.1/ObservedProperties?%24count=false&%24skip=0"

            return_obj = {}

            #list_catalog[]
            headers = {"Content-Type": "application/json"}
            datastreams_response = requests.get(datastream_url, headers=headers)
            datastream_with_units_response = requests.get(datastream_with_units_url, headers=headers)
            properties_response = requests.get(properties_url, headers=headers)
            if datastreams_response.status_code == 200 and datastream_with_units_response.status_code == 200:
                for datastream in datastreams_response.json():
                    datastream_id = datastream["id"]
                    property_id = datastream["observedPropertyId"]
                    
                    for entry in datastream_with_units_response.json()["value"]:
                        if datastream_id == entry["@iot.id"]:
                            unit_name = entry["unitOfMeasurement"]["name"]
                            abbreviation = entry["unitOfMeasurement"]["symbol"]
                            break
                    
                    for entry in properties_response.json()["value"]:
                        if property_id == entry["@iot.id"]:
                            property_name = entry["name"]
                            property_variable_code = entry["properties"]["variableCode"]
                            break

                    if property_name not in return_obj:
                        return_obj[property_name] = {"unit_name": unit_name, "abbreviation": abbreviation, "variable_code": property_variable_code}
                    else:
                        if unit_name not in return_obj[property_name]:
                            return_obj[property_name]["unit_name"] = unit_name
                            return_obj[property_name]["abbreviation"] = abbreviation
                            return_obj[property_name]["variable_code"] = property_variable_code

                sorted_object = dict(sorted(return_obj.items(), key=lambda x: x[0]))

                

                return JsonResponse({"server_type": "hydroserver2", "variables": sorted_object})

            

            

    # print("Finished get_variables_hs Function")

    


@controller(name='get-available-sites', url='get-available-sites/')
def get_available_sites(request):

    if request.method == 'POST':
        specific_group = request.POST.get('group')
        specific_hydroserver = request.POST.get('hs')
        specific_variables = request.POST.getlist('variables[]')
        list_catalog = {}
        SessionMaker = app.get_persistent_store_database(Persistent_Store_Name, as_sessionmaker=True)

        session = SessionMaker()  # Initiate a session
        hydroservers_group = session.query(Groups).filter(Groups.title == specific_group)[0].hydroserver
        # h1 = session.query(Groups).join("hydroserver")
        hs_list = []

        for hydroservers in hydroservers_group:
            if hydroservers.title == specific_hydroserver:
                water = pwml.WaterMLOperations(url=hydroservers.url.strip())
                sitesFiltered = water.GetSitesByVariable(specific_variables)['sites']
                hs_list = sitesFiltered
                # print(hs_list)
                # print("this is the one selecting hs")
                # name = hydroservers.title
                # print(name)
                #
                # # print(hydroservers.title)
                # # print(hydroservers.url)
                # layer_obj = {}
                #
                # layer_obj["title"] = hydroservers.title
                # layer_obj["url"] = hydroservers.url.strip()
                # client = Client(layer_obj["url"])  # Connect to the HydroServer endpoint
                # # print(client)
                # keywords = client.service.GetVariables('[:]')
                # keywords_dict = xmltodict.parse(keywords)
                # keywords_dict_object = json.dumps(keywords_dict)
                #
                # keywords_json = json.loads(keywords_dict_object)
                # # print(client)
                # layer_obj["siteInfoJSON"] =json.loads(hydroservers.siteinfo)
                # layer_obj["siteInfo"] =hydroservers.siteinfo
                # for site in layer_obj["siteInfoJSON"]:
                #
                #     sitecode = site['sitecode']
                #     site_name= site['sitename']
                #     network = site["network"]
                #     layer_obj2={}
                #     layer_obj2['sitecode']=sitecode
                #     layer_obj2['sitename']=site_name
                #     layer_obj2['network']=network
                #     layer_obj2['latitude']=site['latitude']
                #     layer_obj2['longitude']=site['longitude']
                #     print("THIS IS THE ACTUAL SITE")
                #     print(layer_obj2['sitename'])
                #     site_desc = network + ":" + sitecode
                #     site_info_Mc = client.service.GetSiteInfo(site_desc)
                #     site_info_Mc_dict = xmltodict.parse(site_info_Mc)
                #     site_info_Mc_json_object = json.dumps(site_info_Mc_dict)
                #     site_info_Mc_json = json.loads(site_info_Mc_json_object)
                #     # print(site_info_Mc_json)
                #     print(site_info_Mc_json['sitesResponse']['site']['seriesCatalog'])
                #
                #     # print("GETSITESINFO FUNCTION")
                #     # print(object_methods)
                #     object_with_methods_and_variables = {}
                #     object_with_descriptions_and_variables = {}
                #     object_with_time_and_variables = {}
                #     object_methods= {}
                #     if 'series' in site_info_Mc_json['sitesResponse']['site']['seriesCatalog']:
                #         object_methods= site_info_Mc_json['sitesResponse']['site']['seriesCatalog']['series']
                #
                #         if(isinstance(object_methods,(dict))):
                #             # print("adding to the methodID as a dict")
                #             variable_name_ = object_methods['variable']['variableName']
                #             ## this part was added for the WHOS plata broker endpoint ##
                #             if 'method' in object_methods:
                #                 object_with_methods_and_variables[variable_name_]=
                #                   object_methods['method']['@methodID']
                #             else:
                #                 object_with_methods_and_variables[variable_name_]= None
                #             ## end of the part for WHOS plata
                #             object_with_descriptions_and_variables[variable_name_]= object_methods['source'];
                #             object_with_time_and_variables[variable_name_]= object_methods['variableTimeInterval'];
                #             # print(object_with_methods_and_variables)
                #         else:
                #             for object_method in object_methods:
                #                 # print("adding to the methodID as an arraylist")
                #                 variable_name_ = object_method['variable']['variableName']
                #                 if 'method' in object_method:
                #                     object_with_methods_and_variables[variable_name_]=
                #                       object_method['method']['@methodID']
                #                 else:
                #                     object_with_methods_and_variables[variable_name_]= None
                #                 # print(object_method['source'])
                #                 object_with_descriptions_and_variables[variable_name_]= object_method['source'];
                #                 object_with_time_and_variables[variable_name_]= object_method['variableTimeInterval'];
                #                 # print(object_with_methods_and_variables)
                #
                #
                #
                #     array_variables=keywords_json['variablesResponse']['variables']['variable']
                #     array_keywords_hydroserver=[]
                #     array_variables_codes = []
                #     array_variables_lengths = []
                #     length_values = 0
                #
                #
                #     if isinstance(array_variables,type([])):
                #         print("array type")
                #         ijj = 0
                #         for words in array_variables:
                #             # print(ijj)
                #             print("variable name")
                #             print(words['variableName'])
                #             variable_text = words['variableName']
                #             print("compared to the following")
                #             print(specific_variables)
                #             if variable_text in specific_variables:
                #                 print("TRUE compared")
                #
                #                 safety_check_intial = safety_check_intial + 1
                #                 print("we are in the varaible specified")
                #                 code_variable = words['variableCode']['#text']
                #                 start_date = ""
                #                 end_date = ""
                #                 variable_desc = network + ':' + code_variable
                #
                #                 # print("variable_desc")
                #                 # print("varaible in list")
                #                 # print(variable_desc)
                #                 # print(site_desc)
                #                 try:
                #                     values = client.service.GetValues(
                #                         site_desc, variable_desc, start_date, end_date, "")
                #
                #                     values_dict = xmltodict.parse(values)  # Converting xml to dict
                #                     values_json_object = json.dumps(values_dict)
                #                     values_json = json.loads(values_json_object)
                #                     # print(values_json)
                #                     # print(values_json.keys())
                #                     if 'timeSeriesResponse' in values_json:
                #                     # if values_json['timeSeriesResponse'] is not None:
                #                         times_series = values_json['timeSeriesResponse'][
                #                             'timeSeries']  # Timeseries object for the variable
                #                         # print(times_series)
                #                         if times_series['values'] is not None:
                #                             length_values= len(times_series['values']['value'])
                #                             print("this is the length value")
                #                             print(variable_text," ", length_values )
                #                             hs_list.append(layer_obj2)
                #
                #                         else:
                #                             length_values = 0
                #                             print(variable_text," ", length_values )
                #                     ## Addition for the WHOS PLATA ##
                #                     else:
                #                         times_series = values_json['wml1:timeSeriesResponse'][
                #                             'wml1:timeSeries']  # Timeseries object for the variable
                #                         # print(times_series)
                #                         if times_series['wml1:values'] is not None:
                #                             length_values= len(times_series['wml1:values']['wml1:value'])
                #                             print(variable_text," ", length_values )
                #                             hs_list.append(layer_obj2)
                #
                #                         else:
                #                             length_values = 0
                #                             print(variable_text," ", length_values )
                #
                #
                #                     array_variables_lengths.append(length_values)
                #
                #
                #                     array_keywords_hydroserver.append(words['variableName'])
                #                     array_variables_codes.append(words['variableCode']['#text'])
                #                     ijj=ijj+1
                #
                #                 except Exception as e:
                #                     print("OOPS",e.__class__)
                #             # else:
                #             #     if layer_obj2 in hs_list:
                #             #         hs_list.remove(layer_obj2)
                #
                #             # words_to_search[name] = array_keywords_hydroserver
                #
                #
                #     if isinstance(array_variables,dict):
                #         print("dict")
                #         print("variable_name")
                #         print(array_variables['variableName'])
                #         print("compared to the following")
                #         print(specific_variables)
                #
                #         variable_text = array_variables['variableName']
                #         if variable_text in specific_variables:
                #             print("TRUE compared")
                #             safety_check_intial = safety_check_intial + 1
                #             code_variable = array_variables['variableCode']['#text']
                #             start_date = ""
                #             end_date = ""
                #             variable_desc = network + ':' + code_variable
                #
                #             try:
                #                 values = client.service.GetValues(
                #                     site_desc, variable_desc, start_date, end_date, "")
                #                 # print(values)
                #
                #                 values_dict = xmltodict.parse(values)  # Converting xml to dict
                #                 values_json_object = json.dumps(values_dict)
                #                 values_json = json.loads(values_json_object)
                #                 if 'timeSeriesResponse' in values_json:
                #                 # if values_json['timeSeriesResponse'] is not None:
                #                     times_series = values_json['timeSeriesResponse'][
                #                         'timeSeries']  # Timeseries object for the variable
                #                     # print(times_series)
                #                     if times_series['values'] is not None:
                #                         length_values= len(times_series['values']['value'])
                #                         print(variable_text," ", length_values )
                #                         hs_list.append(layer_obj2)
                #
                #                     else:
                #                         length_values = 0
                #                         # print(variable_text," ", length_values )
                #                 ## Addition for the WHOS PLATA ##
                #                 else:
                #                     times_series = values_json['wml1:timeSeriesResponse'][
                #                         'wml1:timeSeries']  # Timeseries object for the variable
                #                     # print(times_series)
                #                     if times_series['wml1:values'] is not None:
                #                         length_values= len(times_series['wml1:values']['wml1:value'])
                #                         print(variable_text," ", length_values )
                #                         hs_list.append(layer_obj2)
                #
                #                     else:
                #                         length_values = 0
                #                         print(variable_text," ", length_values )
                #
                #
                #                 array_variables_lengths.append(length_values)
                #
                #                 array_keywords_hydroserver.append(array_variables['variableName'])
                #                 array_variables_codes.append(array_variables['variableCode']['#text'])
                #             except Exception as e:
                #                 print("OOPS",e.__class__)
                #
                #     return_obj['variables']=array_keywords_hydroserver
                #     return_obj['codes']=array_variables_codes
                #     return_obj['counts'] = array_variables_lengths
                #     return_obj['methodsIDs']= object_with_methods_and_variables
                #     return_obj['description'] = object_with_descriptions_and_variables
                #     return_obj['times_series'] = object_with_time_and_variables
                #     return_obj['siteInfo']= site_info_Mc_json
        # print("Safety check limit")
        # print(safety_check_limit)
        # print("Safety check initial")
        # print(safety_check_intial)
        # if safety_check_intial >= safety_check_limit:
            # list_catalog["hydroserver"] = hs_list
    list_catalog["hydroserver"] = hs_list

    return JsonResponse(list_catalog)


@controller(name='get-hydroserver-info', url='get-hydroserver-info/')
def get_hydroserver_info(request):
    specific_group = request.POST.get('group')
    specific_hs = request.POST.get('hs')
    response_obj = {}
    SessionMaker = app.get_persistent_store_database(Persistent_Store_Name, as_sessionmaker=True)
    session = SessionMaker()  # Initiate a session
    #hydroservers_group = session.query(Groups).filter(Groups.title == specific_group)[0].hydroserver
    # h1=session.query(Groups).join("hydroserver")

    hydroservers_1 = session.query(Groups).filter(Groups.title == specific_group)[0].hydroserver1
    hydroservers_2 = session.query(Groups).filter(Groups.title == specific_group)[0].hydroserver2

    for hydroserver in hydroservers_1:
        name = hydroserver.title
        if name == specific_hs:
            response_obj["url"] = hydroserver.url.strip()
            response_obj["title"] = hydroserver.title
            response_obj["description"] = hydroserver.description
            response_obj["siteInfo"] = json.loads(hydroserver.siteinfo)
            response_obj["server_type"] = "hydroserver1"

            return JsonResponse(response_obj)

    for hydroserver in hydroservers_2:
        name = hydroserver.title
        if name == specific_hs:
            response_obj["url"] = hydroserver.url.strip()
            response_obj["title"] = hydroserver.title
            response_obj["description"] = hydroserver.description
            response_obj["siteInfo"] = json.loads(hydroserver.siteinfo)
            response_obj["server_type"] = "hydroserver2"
            return JsonResponse(response_obj)



    # for hydroservers in hydroservers_group:
    #     name = hydroservers.title
    #     if name == specific_hs:
    #         response_obj["url"] = hydroservers.url.strip()
    #         response_obj["title"] = hydroservers.title
    #         response_obj["description"] = hydroservers.description
    #         response_obj["siteInfo"] = json.loads(hydroservers.siteinfo)

    return JsonResponse(response_obj)


@controller(name='update-hydrosever-groups', url='soap-update/', app_workspace=True)
def upload_hs(request, app_workspace):
    return_obj = {}
    difference = 0

    if request.is_ajax() and request.method == 'POST':
        specific_group = request.POST.get('group')
        specific_hs = request.POST.get('hs')
        SessionMaker = app.get_persistent_store_database(Persistent_Store_Name, as_sessionmaker=True)
        session = SessionMaker()  # Initiate a session
        hydroservers_group = session.query(Groups).filter(Groups.title == specific_group)[0].hydroserver1
        # h1 = session.query(Groups).join("hydroserver")
        for hydroservers in hydroservers_group:
            name = hydroservers.title
            url = hydroservers.url
            if name == specific_hs:
                difference = len(json.loads(hydroservers.siteinfo))
                # client = Client(url, timeout= 500)
                # water = pwml.WaterMLOperations(url = url)
                # sites_object = water.GetSites()

                
                sites = GetSites_WHOS(url)
                sites_parsed_json = json.dumps(sites)
                countries_json = json.dumps(available_regions_2(request, siteinfo=sites_parsed_json,
                                                                app_workspace=app_workspace))
                # print(countries_json)

                variable_json = json.dumps(available_variables_2(url))

                hydroservers.siteinfo = sites_parsed_json
                hydroservers.variables = variable_json
                hydroservers.countries = countries_json

                # sites_parsed_json = json.dumps(sites_object)
                difference = len(sites) - difference
                return_obj["siteInfo"] = json.loads(sites_parsed_json)
                return_obj["sitesAdded"] = difference
                return_obj["url"] = hydroservers.url

        session.commit()
        session.close()

    else:
        return_obj['message'] = 'This request can only be made through a "POST" AJAX call.'

    return JsonResponse(return_obj)


def available_regions_2(request, siteinfo, app_workspace):
    shapely.speedups.enable()
    # countries_geojson_file_path = os.path.join(app_workspace.path, 'countries2.geojson')
    countries_geojson_file_path = os.path.join(app_workspace.path, 'countries3.geojson')
    countries_gdf = gpd.read_file(countries_geojson_file_path)
    countries_series = countries_gdf.loc[:, 'geometry']
    ret_object = {}

    region_list = []
    hydroserver_lat_list = []
    hydroserver_long_list = []
    hydroserver_name_list = []
    hydroserver_country_list = []

    sites = json.loads(siteinfo)
    ls_lats = []
    ls_longs = []
    site_names = []
    countries_list = []
    for site in sites:
        ls_lats.append(site['latitude'])
        ls_longs.append(site['longitude'])
        if 'fullSiteCode' in site:
            site_names.append(site['fullSiteCode'])
        else:
            site_names.append(site['id'])

        if site['country'] != "No Data was Provided":
            countries_list.append(site['country'])

    hydroserver_lat_list.append(ls_lats)
    hydroserver_long_list.append(ls_longs)
    hydroserver_name_list.append(site_names)
    hydroserver_country_list.extend(countries_list)

    if (len(hydroserver_country_list) > 0):
        ret_object['countries'] = list(set(hydroserver_country_list))
        return ret_object

    for indx in range(0, len(hydroserver_name_list)):
        df = pd.DataFrame({'SiteName': hydroserver_name_list[indx], 'Latitude': hydroserver_lat_list[indx],
                           'Longitude': hydroserver_long_list[indx]})
        gdf = gpd.GeoDataFrame(geometry=gpd.points_from_xy(df.Longitude, df.Latitude),
                               index=hydroserver_name_list[indx])
        gdf = gdf.assign(**{str(key): gdf.within(geom) for key, geom in countries_series.items()})
        trues_onlys = gdf.copy()
        trues_onlys = trues_onlys.drop(['geometry'], axis=1)
        trues_onlys = trues_onlys.loc[:, trues_onlys.any()]
        countries_index = list(trues_onlys.columns)
        countries_index = [x for x in countries_index if x != 'geometry']

        countries_index2 = [int(i) for i in countries_index]
        countries_selected = countries_gdf.iloc[countries_index2]
        # list_countries_selected = list(countries_selected['name'])
        # list_countries_selected = list(countries_selected['ADMIN'])
        list_countries_selected = list(countries_selected['admin'])
        for coun in list_countries_selected:
            if coun not in region_list:
                region_list.append(coun)

    ret_object['countries'] = region_list
    return ret_object


def available_variables_2(url):
    hydroserver_type = None
    variables_list = {}
    hydroserver_variable_list = []
    hydroserver_variable_code_list = []
    #Try using hydroserver1 API
    try:
        water = pwml.WaterMLOperations(url=url)
        hs_variables = water.GetVariables()['variables']
        for hs_variable in hs_variables:
            hydroserver_variable_list.append(hs_variable['variableName'])
            hydroserver_variable_code_list.append(hs_variable['variableCode'])

        hydroserver_type = 1

    #Use hydroserver 2 API
    except Exception as e:
        headers = {'accept':'application/json'}

        url = url.split("?WSDL")[0]
        datastreams_url = f"{url}/api/data/datastreams"
        properties_url = f"{url}/api/sensorthings/v1.1/ObservedProperties?%24count=false&%24skip=0"

        datastreams_response = requests.get(datastreams_url,headers=headers)
        properties_response = requests.get(properties_url, headers=headers)
        
        # import pdb
        # pdb.set_trace()

        datastreams = datastreams_response.json()
        properties = properties_response.json()
    
        for datastream in datastreams:
            property_id = datastream["observedPropertyId"]

            for entry in properties["value"]:
                if property_id == entry["@iot.id"]:
                    property_name = entry["name"]
                    break
                    
            
            hydroserver_variable_list.append(property_name)
            hydroserver_variable_code_list.append(property_id)

        hydroserver_type = 2

    variables_list["variables"] = hydroserver_variable_list
    variables_list["variables_codes"] = hydroserver_variable_code_list
    return variables_list, hydroserver_type


# #####*****************************************************************************************################
# #####**ADD A HYDROSERVER TO THE SELECTED GROUP OF HYDROSERVERS THAT WERE CREATED BY THE USER *################
# #####*****************************************************************************************################
@controller(name='add-hydrosever-groups', url='soap-group/', app_workspace=True)
def soap_group(request, app_workspace):
    # logging.basicConfig(level=logging.INFO)
    # logging.getLogger('suds.client').setLevel(logging.DEBUG)
    return_obj = {}
    if request.is_ajax() and request.method == 'POST':
        url = request.POST.get('soap-url')
        title = request.POST.get('soap-title')
        # title = title.replace(" ", "")
        # title = title.translate ({ord(c): "_" for c in "!@#$%^&*()[]{};:,./<>?\|`~-=+"})
        group = request.POST.get('actual-group')
        # print(group)
        description = request.POST.get('textarea')
        # Getting the current map extent
        true_extent = request.POST.get('extent')

        if "?WSDL" not in url:
            url = url + "?WSDL"
        water = pwml.WaterMLOperations(url=url)
        # imp = Import('http://schemas.xmlsoap.org/soap/envelope')
        # doctor = ImportDoctor(imp)
        # water.client = Client(url, doctor = doctor)
        # client = Client(url, timeout= 500)

        # EJones added; sites_parsed_json was not being initialized before being used

        #Try adding hydroserver 2 or 1 first

       
        sites = GetSites_WHOS(url)
        if sites != "invalid url":
            sites_parsed_json = json.dumps(sites)
        else:
            pass

        # import pdb
        # pdb.set_trace
        
        # True Extent is on and necessary if the user is trying to add USGS or
        # some of the bigger HydroServers.
        if true_extent == 'on':
            extent_value = request.POST['extent_val']
            return_obj['zoom'] = 'true'
            return_obj['level'] = extent_value
            ext_list = extent_value.split(',')
            sitesByBoundingBox = water.GetSitesByBoxObject(ext_list, 'epsg:3857')
            countries_json = available_regions_2(request, sites_parsed_json, app_workspace=app_workspace)
            variable_json,hydroserver_type = available_variables_2(url)


            if hydroserver_type == 2:
                url = url.split("?WSDL")[0]


            return_obj['title'] = title
            return_obj['url'] = url
            return_obj['description'] = description

            return_obj['siteInfo'] = sitesByBoundingBox
            return_obj['group'] = group
            return_obj['status'] = "true"

            SessionMaker = app.get_persistent_store_database(
                Persistent_Store_Name, as_sessionmaker=True)
            session = SessionMaker()
            hydroservers_group = session.query(Groups).filter(Groups.title == group).first()
            # hydroservers_g = session.query(Groups).filter(Groups.title == group)
            if hydroserver_type == 1:
                hs = Hydroserver_Individual_Cuahsi(title=title,
                                                   url=url,
                                                   description=description,
                                                   siteinfo=sites_parsed_json,
                                                   variables=variable_json,
                                                   countries=countries_json)
                hydroservers_group.hydroserver1.append(hs)

#                 hs_one = HydroServer_Individual(title=title,
#                     url=url,
#                     description=description,
#                     siteinfo=sites_parsed_json,
#                     variables=variable_json,
#                     countries=countries_json)
# #                               siteinfo=sitesByBoundingBoxs)
            elif hydroserver_type == 2:
                hs = Hydroserver_Individual_Sensor(title=title,
                                                   url=url,
                                                   description=description,
                                                   siteinfo=sites_parsed_json,
                                                   variables=variable_json,
                                                   countries=countries_json)
                hydroservers_group.hydroserver2.append(hs)

            #hydroservers_group.hydroserver.append(hs)
            session.add(hydroservers_group)
            session.commit()
            session.close()

        else:

            return_obj['zoom'] = 'false'
            # sites = water.GetSites()
            
            sites = GetSites_WHOS(url)
            sites_parsed_json = json.dumps(sites)
            # print(sites_parsed_json)
            try:
                countries_json = json.dumps(available_regions_2(request, siteinfo=sites_parsed_json,
                                                                app_workspace=app_workspace))
                # print(countries_json)
                #variable_json = json.dumps(available_variables_2(url))
                variable_json, hydroserver_type = available_variables_2(url)
                variable_json = json.dumps(variable_json)

                # print(variable_json)
            except Exception as e:
                print(e)

            if hydroserver_type == 2:
                url = url.split("?WSDL")[0]

            return_obj['title'] = title
            return_obj['url'] = url
            return_obj['description'] = description
            return_obj['siteInfo'] = sites
            return_obj['group'] = group
            return_obj['status'] = "true"

            if hydroserver_type == 1:
                server_type = "hydroserver1"
            else:
                server_type = "hydroserver2"

            return_obj['server_type'] = server_type
            # print(return_obj)
            SessionMaker = app.get_persistent_store_database(
                Persistent_Store_Name, as_sessionmaker=True)
            session = SessionMaker()
            hydroservers_group = session.query(Groups).filter(Groups.title == group).first()

            if hydroserver_type == 1:
                hs = Hydroserver_Individual_Cuahsi(title=title,
                                                   url=url,
                                                   description=description,
                                                   siteinfo=sites_parsed_json,
                                                   variables=variable_json,
                                                   countries=countries_json)
                
                hydroservers_group.hydroserver1.append(hs)
            elif hydroserver_type == 2:
                hs = Hydroserver_Individual_Sensor(title=title,
                                                   url=url,
                                                   description=description,
                                                   siteinfo=sites_parsed_json,
                                                   variables=variable_json,
                                                   countries=countries_json)
                
                hydroservers_group.hydroserver2.append(hs)

            # hs_one = HydroServer_Individual(title=title,
            #                                 url=url,
            #                                 description=description,
            #                                 siteinfo=sites_parsed_json,
            #                                 variables=variable_json,
            #                                 countries=countries_json)

            #hydroservers_group.hydroserver.append(hs)
            session.add(hydroservers_group)
            session.commit()
            session.close()

    else:
        return_obj[
            'message'] = 'This request can only be made through a "POST" AJAX call.'
    print("Completed adding to DB")
    return JsonResponse(return_obj)


# #####*****************************************************************************************################
# ############################# DELETE THE HYDROSERVER OF AN SPECIFIC GROUP ####################################
# #####*****************************************************************************************################
@controller(name='delete-group-hydroserver', url='delete-group-hydroserver/')
def delete_group_hydroserver(request):
    list_catalog = {}
    SessionMaker = app.get_persistent_store_database(
        Persistent_Store_Name, as_sessionmaker=True)
    session = SessionMaker()

    # Query DB for hydroservers
    if request.is_ajax() and request.method == 'POST':
        titles = request.POST.getlist('server')
        # group = request.POST.get('actual-group')

        # title = request.POST['server']
        i = 0
        # hydroservers_group = session.query(Groups).filter(Groups.title == group)[0].hydroserver

        for title in titles:
            session.query(Hydroserver_Individual_Cuahsi).filter(Hydroserver_Individual_Cuahsi.title == title).delete(synchronize_session='evaluate')
            session.query(Hydroserver_Individual_Sensor).filter(Hydroserver_Individual_Sensor.title == title).delete(synchronize_session='evaluate')

            # session.query(HydroServer_Individual).filter(HydroServer_Individual.title == title).\
            #     delete(synchronize_session='evaluate')  # Deleting the record from the local catalog
            session.commit()
            session.close()

            # Returning the deleted title. To let the user know that the particular
            # title is deleted.
            i_string = str(i)
            # list["title"] = title
            list_catalog[i_string] = title
            i = i + 1
    return JsonResponse(list_catalog)
