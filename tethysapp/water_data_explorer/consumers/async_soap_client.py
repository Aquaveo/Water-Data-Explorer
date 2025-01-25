import httpx
import xml.etree.ElementTree as ET
from typing import AsyncGenerator, Optional, Dict, Any, List
import xmltodict
import aiofiles
import tempfile
import os
import logging
import asyncio
from math import ceil
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AsyncSOAPClient:
    def __init__(self):
        # You can store default headers or any other settings here
        self.CHUNK_SITE_SIZE = 512000
        self.MAX_CHUNK_MULTIPLIER = 32  # Maximum multiplier to prevent oversized chunks
        self.DEFAULT_BATCH_SIZE = 500   # Default batch size if not determined by sites_count
        
        # Define batch size thresholds and corresponding multipliers
        self.BATCH_SIZE_CONFIG = [
            (1000, self.DEFAULT_BATCH_SIZE),
            (10000, 5000),
            (50000, 10000),
            (100000, 20000),
            (500000, 100000),
            (1000000, 500000),
        ]
        self.MAX_BATCH_SIZE = 1000000  # Cap to prevent oversized batches
    
    def get_sites_batch_size(self, sites_count: int) -> int:
        """
        Determines the optimal batch size based on the number of sites.
        
        Args:
            sites_count (int): The total number of sites to process.
        
        Returns:
            int: The calculated batch size.
        """
        for threshold, batch_size in self.BATCH_SIZE_CONFIG:
            if sites_count < threshold:
                logger.info(f"Determined batch size: {batch_size} for {sites_count} sites.")
                return batch_size
        # If sites_count exceeds all thresholds, return MAX_BATCH_SIZE
        logger.info(f"Determined batch size: {self.MAX_BATCH_SIZE} for {sites_count} sites.")
        return self.MAX_BATCH_SIZE
    
    def get_sites_chunk_size(self, sites_count: int) -> int:
        """
        Determines the optimal chunk size based on the number of sites.
        
        Args:
            sites_count (int): The total number of sites to process.
        
        Returns:
            int: The calculated chunk size in bytes.
        """
        base_size = self.CHUNK_SITE_SIZE
        max_multiplier = self.MAX_CHUNK_MULTIPLIER
        
        if sites_count < 10_000:
            multiplier = 1
        elif sites_count < 50_000:
            multiplier = 4
        elif sites_count < 100_000:
            multiplier = 8
        elif sites_count < 500_000:
            multiplier = 16    
        else:
            multiplier = max_multiplier  # Cap the multiplier to prevent oversized chunks
        
        chunk_size = base_size * multiplier
        
        logger.info(f"Determined chunk size: {chunk_size} bytes for {sites_count} sites.")
        return chunk_size

    async def get_sites_from_endpoint(self, url: str, sites_count: int) -> AsyncGenerator[List[Dict[str, Any]], None]:
        """
        Make an async GET request using httpx,
        stream the response to a temporary file using aiofiles,
        parse the XML response using xmltodict,
        and return an asynchronous generator that yields batches of site dictionaries.

        Args:
            url (str): The SOAP endpoint URL.
            sites_count (int): The total number of sites to process.

        Yields:
            AsyncGenerator[List[Dict[str, Any]], None]: Batches of site dictionaries.
        """
        headers = {
            "Accept": "application/xml",
        }

        temp_file_path = None
        
        # Create a temporary file
        temp_file = tempfile.NamedTemporaryFile(delete=False, mode='wb')
        temp_file_path = temp_file.name
        temp_file.close()
        logger.info(f"Temporary file created at {temp_file_path}")

        # Determine batch size and chunk size based on sites_count
        batch_size = self.get_sites_batch_size(sites_count)
        chunk_size_bytes = self.get_sites_chunk_size(sites_count)

        # Stream the response to the temporary file
        async with httpx.AsyncClient() as client:
            try:
                async with client.stream('GET', url, headers=headers, timeout=None) as response:
                    response.raise_for_status()
                    async with aiofiles.open(temp_file_path, mode='wb') as tmp_file:
                        total_downloaded = 0
                        async for chunk in response.aiter_bytes(chunk_size=chunk_size_bytes):
                            await tmp_file.write(chunk)
                            total_downloaded += len(chunk)
                            logger.info(f"Downloaded {total_downloaded} bytes so far.")
            except httpx.RequestError as e:
                logger.error(f"An error occurred while requesting {e.request.url!r}: {e}")
                return
            except httpx.HTTPStatusError as e:
                logger.error(f"Error response {e.response.status_code} while requesting {e.request.url!r}")
                return

        # Read the temporary file content
        try:
            async with aiofiles.open(temp_file_path, mode='r', encoding='utf-8') as tmp_file:
                response_text = await tmp_file.read()
                logger.info(f"Successfully read {len(response_text)} characters from temporary file.")
        except Exception as e:
            logger.error(f"Error reading temporary SOAP response file: {e}")
            return
        finally:
            # Remove the temporary file
            if temp_file_path and os.path.exists(temp_file_path):
                os.remove(temp_file_path)
                logger.info(f"Temporary file {temp_file_path} removed.")

        # Parse the XML response
        try:
            xml_dict = xmltodict.parse(response_text)
            logger.info("Successfully parsed SOAP response XML.")
        except Exception as e:
            logger.error(f"Error parsing SOAP response: {e}")
            return

        # Extract sitesResponse
        try:
            sites_response = xml_dict['soap:Envelope']['soap:Body']['GetSitesObjectResponse']['sitesResponse']
            if not sites_response:
                logger.warning("sitesResponse is empty.")
                return
            logger.info("Successfully extracted sitesResponse.")
        except KeyError as e:
            logger.error(f"Expected key not found in SOAP response: {e}")
            return

        # Extract 'site' elements
        try:
            sites = sites_response.get('site', [])

            if isinstance(sites, dict):
                sites = [sites]
            elif not isinstance(sites, list):
                logger.warning("Unexpected structure for sites.")
                return
            logger.info(f"Found {len(sites)} site(s) in the response.")
        except Exception as e:
            logger.error(f"Error extracting site elements: {e}")
            return

        # Iterate over each site element and yield site dictionaries in batches
        batch = []
        for site in sites:
            site_dict = await asyncio.to_thread(self.parse_site, site)
            if site_dict:
                batch.append(site_dict)
            if len(batch) == batch_size:
                yield batch
                batch = []
        if batch:
            yield batch
        logger.info("Done with all sites.")

    def parse_site(self, site: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Parses a single site dictionary from xmltodict and returns a standardized site dictionary.
        """
        try:
            site_info = site.get('siteInfo', {})
            site_name = site_info.get('siteName', "Unknown Site").strip()
            hs_json = {"sitename": site_name}

            geog_location = site_info.get('geoLocation', {}).get('geogLocation', {})
            latitude = geog_location.get('latitude')
            longitude = geog_location.get('longitude')
            hs_json["latitude"] = float(latitude) if latitude else None
            hs_json["longitude"] = float(longitude) if longitude else None

            site_code_info = site_info.get('siteCode', {})
            hs_json["sitecode"] = site_code_info.get('#text', "").strip()
            hs_json["network"] = site_code_info.get('@network', "")
            hs_json["siteID"] = site_code_info.get('@siteID', "")

            elevation = site_info.get('elevation_m')
            hs_json["elevation"] = float(elevation) if elevation else 0.0

            # Extract country
            hs_json["country"] = "No Data was Provided"
            site_properties = site_info.get('siteProperty', [])
            if isinstance(site_properties, dict):
                site_properties = [site_properties]
            for prop in site_properties:
                if prop.get('@name') == 'Country':
                    hs_json["country"] = prop.get('#text', "No Data was Provided").strip()
                    break

            hs_json["fullSiteCode"] = f"{hs_json.get('network', '')}:{hs_json.get('sitecode', '')}"
            hs_json["service"] = "SOAP"

            # Validate coordinates
            if hs_json["latitude"] is None or hs_json["longitude"] is None:
                logger.warning(f"Invalid coordinates for site: {hs_json.get('sitename', 'Unknown')}")
                return None

        except Exception as e:
            logger.error(f"Error extracting site data: {e}")
            return None

        return hs_json
    
    async def get_catalog_services(self, url):
        """
        Make an async SOAP request to get catalog services.
        """
        soap_action = "http://www.cuahsi.org/his/1.1/ws/GetWaterOneFlowServiceInfo"
        soap_envelope = """
        <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                    xmlns:xsd="http://www.w3.org/2001/XMLSchema"
                    xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
        <soap:Body>
            <GetWaterOneFlowServiceInfo xmlns="http://www.cuahsi.org/his/1.1/ws/" />
        </soap:Body>
        </soap:Envelope>
        """

        headers = {
            "Content-Type": "text/xml; charset=utf-8",
            "SOAPAction": soap_action
        }

        async with httpx.AsyncClient(verify=True) as client:
            response = await client.post(url, content=soap_envelope, headers=headers, timeout=None)
            response.raise_for_status()  # Raise an exception if request failed

            # Parse the XML response
            root = ET.fromstring(response.text)
            return self._parse_catalog_services(root)

    async def _parse_catalog_services(self, root):
        """
        Asynchronous generator to parse the XML response and yield services.
        """
        namespaces = {'ns': 'http://hiscentral.cuahsi.org/20100205/'}
        service_info_list = root.findall('.//ns:ServiceInfo', namespaces)

        for si in service_info_list:
            serv_url = si.find('ns:servURL', namespaces)
            title = si.find('ns:Title', namespaces)
            valuecount = si.find('ns:valuecount', namespaces)
            sitecount = si.find('ns:sitecount', namespaces)
            variablecount = si.find('ns:variablecount', namespaces)

            # Extract text or default values
            serv_url_text = serv_url.text if serv_url is not None else ""
            title_text = title.text if title is not None else ""
            valuecount_text = int(valuecount.text) if valuecount is not None and valuecount.text.isdigit() else 0
            sitecount_text = int(sitecount.text) if sitecount is not None and sitecount.text.isdigit() else 0
            variablecount_text = int(variablecount.text) if variablecount is not None and variablecount.text.isdigit() else 0

            # Asynchronously yield the service dictionary
            yield {
                "servURL": serv_url_text,
                "title": title_text,
                "valuecount": valuecount_text,
                "sitecount": sitecount_text,
                "variablecount": variablecount_text
            }


    async def get_site_info(self, url: str) -> AsyncGenerator[Dict[str, Any], None]:
        """
        Fetch XML from the given `url` using an HTTP GET request,
        parse the SOAP/WaterML response, and yield site-info dicts, one per 'series'.
        """

        headers = {
            "Accept": "application/xml",
        }
        # 1) Fetch the XML
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=headers, timeout=None)
            response.raise_for_status()
            response_text = response.text

        # 2) Parse the SOAP XML
        try:
            xml_dict = xmltodict.parse(response_text)
        except Exception as e:
            # If parsing fails, just return (yield nothing)
            return

        # 3) Navigate to the site -> series section
        try:
            sites_response = xml_dict['soap:Envelope']['soap:Body'] \
                                     ['GetSiteInfoObjectResponse']['sitesResponse']
            site = sites_response['site']
            # siteInfo
            object_siteInfo = site['siteInfo']
            # One or many "series" entries
            object_methods = site['seriesCatalog']['series']
        except KeyError:
            # Missing data
            return

        # 4) Handle single vs. multiple series
        if isinstance(object_methods, dict):
            # Only one series -> parse once
            record = self._parse_site_info(object_siteInfo, object_methods)
            minimal_record = self._transform_site_info(record)
            yield record
        elif isinstance(object_methods, list):
            # Multiple series -> parse each
            for method in object_methods:
                record = self._parse_site_info(object_siteInfo, method)
                minimal_record = self._transform_site_info(record)
                yield record
        else:
            # Unexpected structure => yield nothing
            return


    def _transform_site_info(self, record: Dict[str, Any]) -> Dict[str, Any]:
        """
        Take the full record from _parse_site_info and return only:
        - beginDateTime
        - endDateTime
        - variable_name (concatenate variableName-dataType)
        - variableCode (use fullVariableCode)
        - siteCode (use fullSiteCode)
        - timeUnitName (use timeUnitName)
        - timeSupport (use timeSupport)
        """
        # Fallback for missing fields
        variable_name = record.get('variableName', "No Data was Provided")
        data_type = record.get('dataType', "No Data was Provided")

        return {
            "beginDateTime": record.get("beginDateTime", "No Data was Provided"),
            "endDateTime": record.get("endDateTime", "No Data was Provided"),
            "variable_name": f"{variable_name}-{data_type}",
            "variableCode": record.get("fullVariableCode", "No Data was Provided"),
            "siteCode": record.get("fullSiteCode", "No Data was Provided"),
            "timeUnitName": record.get("timeUnitName", "No Data was Provided"),
            "timeSupport": record.get("timeSupport", "No Data was Provided"),
        }


    def _parse_site_info(self, object_siteInfo: Dict[str, Any], object_methods: Dict[str, Any]) -> Dict[str, Any]:
        """
        Convert the 'siteInfo' + 'series' (variable metadata) into a single dictionary.
        Fill missing fields with 'No Data was Provided'. 
        (Implementation mirrors the logic from your JS getSiteInfoHelperJS.)
        """
        return_obj = {}

        # -- Country --
        return_obj['country'] = "No Data was Provided"
        site_property = object_siteInfo.get('siteProperty')
        if site_property:
            if isinstance(site_property, list):
                for prop in site_property:
                    if prop.get('@name') == 'Country':
                        return_obj['country'] = prop.get('#text', "No Data was Provided")
            elif isinstance(site_property, dict):
                if site_property.get('@name') == 'Country':
                    return_obj['country'] = site_property.get('#text', "No Data was Provided")

        # -- siteName --
        return_obj['siteName'] = object_siteInfo.get('siteName', "No Data was Provided")

        # -- latitude/longitude/geolocation --
        geoLocation = (object_siteInfo.get('geoLocation') or {}).get('geogLocation') or {}
        return_obj['latitude'] = geoLocation.get('latitude', "No Data was Provided")
        return_obj['longitude'] = geoLocation.get('longitude', "No Data was Provided")
        return_obj['geolocation'] = geoLocation if geoLocation else "No Data was Provided"

        # -- network --
        siteCode = object_siteInfo.get('siteCode', {})
        network = None
        if isinstance(siteCode, dict):
            # Some WaterML structures store '@network' under siteCode['attr']['@network']
            # Others store it directly as siteCode['@network']
            if 'attr' in siteCode and isinstance(siteCode['attr'], dict):
                network = siteCode['attr'].get('@network')
            if not network:
                network = siteCode.get('@network')
        return_obj['network'] = network if network else "No Data was Provided"

        # -- siteCode (#text) --
        if isinstance(siteCode, dict):
            return_obj['siteCode'] = siteCode.get('#text', "No Data was Provided")
        else:
            return_obj['siteCode'] = "No Data was Provided"

        # -- fullSiteCode --
        if (return_obj['network'] != "No Data was Provided" and 
            return_obj['siteCode'] != "No Data was Provided"):
            return_obj['fullSiteCode'] = f"{return_obj['network']}:{return_obj['siteCode']}"
        else:
            return_obj['fullSiteCode'] = "No Data was Provided"

        # -- object_methods => variable metadata --
        variable = object_methods.get('variable', {})
        return_obj['variableName'] = variable.get('variableName', "No Data was Provided")
        
        var_code_dict = variable.get('variableCode', {})
        if isinstance(var_code_dict, dict):
            vc_text = var_code_dict.get('#text')
        else:
            vc_text = None
        return_obj['variableCode'] = vc_text if vc_text else "No Data was Provided"

        # -- fullVariableCode --
        if (return_obj['network'] != "No Data was Provided" and
            return_obj['variableCode'] != "No Data was Provided"):
            return_obj['fullVariableCode'] = f"{return_obj['network']}:{return_obj['variableCode']}"
        else:
            return_obj['fullVariableCode'] = "No Data was Provided"

        # -- variableCount (valueCount) --
        return_obj['variableCount'] = object_methods.get('valueCount', "No Data was Provided")

        # -- dataType, valueType, generalCategory, noDataValue, sampleMedium, speciation --
        return_obj['dataType']         = variable.get('dataType', "No Data was Provided")
        return_obj['valueType']        = variable.get('valueType', "No Data was Provided")
        return_obj['generalCategory']  = variable.get('generalCategory', "No Data was Provided")
        return_obj['noDataValue']      = variable.get('noDataValue', "No Data was Provided")
        return_obj['sampleMedium']     = variable.get('sampleMedium', "No Data was Provided")
        return_obj['speciation']       = variable.get('speciation', "No Data was Provided")

        # -- timeScale & isRegular --
        timeScale = variable.get('timeScale', {})
        ts_unit = timeScale.get('unit', {})
        return_obj['timeUnitAbbreviation'] = ts_unit.get('unitAbbreviation', "No Data was Provided")
        return_obj['timeUnitName']         = ts_unit.get('unitName', "days")
        return_obj['timeUnitType']         = ts_unit.get('unitType', "No Data was Provided")
        return_obj['timeSupport']          = timeScale.get('timeSupport', "1.0")
        return_obj['isRegular']            = timeScale.get('@isRegular', "No Data was Provided")

        # -- method --
        method = object_methods.get('method')
        if method:
            return_obj['methodID']          = method.get('@methodID', "No Method Id was provided")
            return_obj['methodDescription'] = method.get('methodDescription', "No Method Description was provided")
        else:
            return_obj['methodID']          = "No Method Id was provided"
            return_obj['methodDescription'] = "No Method Description was provided"

        # -- qualityControlLevel --
        qcl = object_methods.get('qualityControlLevel', {})
        if isinstance(qcl, dict):
            return_obj['qualityControlLevelID'] = qcl.get('@qualityControlLevelID', "No Data was Provided")
            return_obj['definition']            = qcl.get('definition', "No Data was Provided")
            return_obj['qualityControlLevelCode'] = qcl.get('qualityControlLevelCode', "No Data was Provided")
        else:
            return_obj['qualityControlLevelID']  = "No Data was Provided"
            return_obj['definition']             = "No Data was Provided"
            return_obj['qualityControlLevelCode'] = "No Data was Provided"

        # -- source --
        source = object_methods.get('source', {})
        return_obj['citation']      = source.get('citation', "No Data was Provided")
        return_obj['organization']  = source.get('organization', "No Data was Provided")
        return_obj['description']   = source.get('sourceDescription', "No Data was Provided")

        # -- variableTimeInterval --
        vti = object_methods.get('variableTimeInterval', {})
        return_obj['beginDateTime']    = vti.get('beginDateTime', "No Data was Provided")
        return_obj['endDateTime']      = vti.get('endDateTime', "No Data was Provided")
        return_obj['beginDateTimeUTC'] = vti.get('beginDateTimeUTC', "No Data was Provided")
        return_obj['endDateTimeUTC']   = vti.get('endDateTimeUTC', "No Data was Provided")

        return_obj['variableTimeInterval'] = vti if vti else "No Data was Provided"

        return return_obj



    async def get_values(
        self,
        url: str,
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """
        Retrieves and parses time series data from the XML response as an asynchronous generator.

        Args:
            url (str): Endpoint to fetch the XML response.

        Yields:
            Dict[str, Any]: Parsed time series data.
        """
        headers = {
            "Accept": "application/xml",
        }

        # Fetch the XML
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=headers, timeout=None)
            response.raise_for_status()
            response_text = response.text

        try:
            # Parse XML into a dictionary
            xml_data = xmltodict.parse(response_text)
            # Navigate to the `timeSeries` section
            time_series_data = xml_data["soap:Envelope"]["soap:Body"]["TimeSeriesResponse"]["timeSeriesResponse"]["timeSeries"]

            if isinstance(time_series_data, dict):
                time_series_data = [time_series_data]  # Normalize single time series to a list

            # Process each time series
            for time_series in time_series_data:
                try:
                    # Initialize result object for parsed metadata
                    result_obj = {}
                    result_obj = self.parse_timeseries_metadata(time_series, result_obj)

                    # Extract and parse individual values
                    values_section = time_series.get("values", {}).get("value", [])
                    if isinstance(values_section, dict):
                        values_section = [values_section]  # Normalize single value to a list

                    for value in values_section:
                        # Parse individual value and yield result
                        value_obj = self.parse_timeseries_value(value, result_obj.copy())
                        yield value_obj

                except Exception as e:
                    logger.error(f"Error processing time series: {e}")

        except Exception as e:
            logger.error(f"Error parsing XML data: {e}")


    @staticmethod
    def parse_timeseries_metadata(times_series: Dict[str, Any], result_obj: Dict[str, Any]) -> Dict[str, Any]:
        """
        Helper method to parse metadata for time series data and store it in a dictionary.
        """
        try:
            ## Commented out because not need of the metadata
            # source_info = times_series.get("sourceInfo", {})
            # result_obj["siteName"] = source_info.get("siteName", "No Data Provided")
            # result_obj["siteCode"] = source_info.get("siteCode", {}).get("#text", "No Data Provided")
            # result_obj["network"] = source_info.get("siteCode", {}).get("@network", "No Data Provided")
            # result_obj["siteID"] = source_info.get("siteCode", {}).get("@siteID", "No Data Provided")
            # result_obj["latitude"] = source_info.get("geoLocation", {}).get("geogLocation", {}).get("latitude", "No Data Provided")
            # result_obj["longitude"] = source_info.get("geoLocation", {}).get("geogLocation", {}).get("longitude", "No Data Provided")

            variable = times_series.get("variable", {})
            result_obj["unitName"] = variable.get("unit", {}).get("unitName", "No Data Provided")
            result_obj["unitAbbreviation"] = variable.get("unit", {}).get("unitAbbreviation", "No Data Provided")
            result_obj["noDataValue"] = variable.get("noDataValue", "No Data Provided")

            ## Commented out because not need of the metadata
            
            # result_obj["variableName"] = variable.get("variableName", "No Data Provided")
            # result_obj["dataType"] = variable.get("dataType", "No Data Provided")

            time_scale = variable.get("timeScale", {})
            result_obj["timeUnitName"] = time_scale.get("unit", {}).get("unitName", "No Data Provided")
            result_obj["timeUnitAbbreviation"] = time_scale.get("unit", {}).get("unitAbbreviation", "No Data Provided")
            # result_obj["timeSupport"] = time_scale.get("timeSupport", "No Data Provided")

        except Exception as e:
            logger.error(f"Error parsing time series metadata: {e}")

        return result_obj


    @staticmethod
    def parse_timeseries_value(value: Dict[str, Any], result_obj: Dict[str, Any]) -> Dict[str, Any]:
        """
        Parses individual time series values and adds them to the result object.
        """
        try:
            result_obj["dateTime"] = value.get("@dateTime", "No Date found")
            result_obj["dataValue"] = float(value.get("#text", 0.0))

            ## Commented out because not need of the metadata
            # result_obj["dateTimeUTC"] = value.get("@dateTimeUTC", "No Date UTC found")
            # result_obj["methodID"] = value.get("@methodID", "No Method ID Provided")
            # result_obj["sampleID"] = value.get("@sampleID", "No Sample ID Provided")
            # result_obj["sourceCode"] = value.get("@sourceCode", "No Source Code Provided")
            # result_obj["timeOffset"] = value.get("@timeOffset", "No Time Offset Provided")
        except Exception as e:
            logger.error(f"Error parsing time series value: {e}")
        return result_obj 