import httpx
import xml.etree.ElementTree as ET
from typing import AsyncGenerator, Optional, Dict, Any
import xmltodict
import aiofiles
import tempfile
import os

class AsyncSOAPClient:
    def __init__(self):
        # You can store default headers or any other settings here
        pass
    async def get_sites_from_endpoint(self, url: str) -> AsyncGenerator[Dict[str, Any], None]:
        """
        Make an async GET request using httpx,
        stream the response to a temporary file using aiofiles,
        parse the XML response using xmltodict,
        and return an asynchronous generator that yields site dictionaries one by one.
        """
        # 1) Define headers if necessary (excluding SOAPAction and SOAP envelope)
        headers = {
            "Accept": "application/xml",
            # "Content-Type" can be omitted or set appropriately
        }

        # 2) Create a temporary file to store the streamed response
        temp_file_path = None
        # Create a temporary file
        temp_file = tempfile.NamedTemporaryFile(delete=False, mode='wb')
        temp_file_path = temp_file.name
        temp_file.close()  # Close the file so aiofiles can open it asynchronously
        print(f"Temporary file created at {temp_file_path}")

        # 3) Make an async GET request and stream the response
        async with httpx.AsyncClient() as client:
            try:
                async with client.stream('GET', url, headers=headers, timeout=None) as response:
                    response.raise_for_status()
                    async with aiofiles.open(temp_file_path, mode='wb') as tmp_file:
                        async for chunk in response.aiter_bytes(chunk_size=4096):
                            # Optional: Uncomment the next line for debugging
                            # print(f"Writing chunk of size {len(chunk)}")
                            await tmp_file.write(chunk)
            except httpx.RequestError as e:
                # Handle network-related errors
                print(f"An error occurred while requesting {e.request.url!r}: {e}")
                return  # Yield nothing if request fails
            except httpx.HTTPStatusError as e:
                # Handle non-2xx responses
                print(f"Error response {e.response.status_code} while requesting {e.request.url!r}")
                return  # Yield nothing if response is invalid

        # 4) Read the temporary file content asynchronously
        try:
            async with aiofiles.open(temp_file_path, mode='r', encoding='utf-8') as tmp_file:
                response_text = await tmp_file.read()
        except Exception as e:
            print(f"Error reading temporary SOAP response file: {e}")
            return  # Yield nothing if reading fails
        finally:
            # 5) Remove the temporary file
            if temp_file_path and os.path.exists(temp_file_path):
                os.remove(temp_file_path)
                print(f"Temporary file {temp_file_path} removed.")

        # 6) Parse the SOAP XML body using xmltodict
        try:
            # Convert XML to OrderedDict
            xml_dict = xmltodict.parse(response_text)
        except Exception as e:
            # Handle parsing errors
            print(f"Error parsing SOAP response: {e}")
            return  # Yield nothing if parsing fails

        # 7) Extract the sitesResponse content
        try:
            # Navigate through the OrderedDict to get to sitesResponse
            sites_response = xml_dict['soap:Envelope']['soap:Body']['GetSitesObjectResponse']['sitesResponse']
            if not sites_response:
                print("sitesResponse is empty.")
                return  # Yield nothing if sitesResponse is empty
        except KeyError as e:
            print(f"Expected key not found in SOAP response: {e}")
            return  # Yield nothing if structure is unexpected

        # 8) Extract 'site' elements
        try:
            sites = sites_response.get('site', [])

            # Ensure sites is a list
            if isinstance(sites, dict):
                sites = [sites]
            elif not isinstance(sites, list):
                print("Unexpected structure for sites.")
                return  # Yield nothing if structure is unexpected

        except Exception as e:
            print(f"Error extracting site elements: {e}")
            return  # Yield nothing if extraction fails

        # 9) Iterate over each site element and yield site dictionaries
        for site in sites:
            site_dict = self.parse_site(site)
            breakpoint()
            if site_dict:
                yield site_dict

    def parse_site(self, site: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Parses a single site dictionary from xmltodict and returns a standardized site dictionary.
        """
        hs_json = {}

        try:
            # Extract siteName
            site_name = site['siteInfo']['siteName']
            if isinstance(site_name, str):
                hs_json["sitename"] = site_name.strip()
            else:
                hs_json["sitename"] = "Unknown Site"

            # Extract latitude and longitude
            latitude = site['siteInfo']['geoLocation']['geogLocation']['latitude']
            longitude = site['siteInfo']['geoLocation']['geogLocation']['longitude']
            hs_json["latitude"] = float(latitude) if latitude else None
            hs_json["longitude"] = float(longitude) if longitude else None

            # Extract siteCode attributes and text
            site_code_info = site['siteInfo']['siteCode']
            hs_json["sitecode"] = site_code_info['#text'].strip() if site_code_info.get('#text') else ""
            hs_json["network"] = site_code_info.get('@network', "")
            hs_json["siteID"] = site_code_info.get('@siteID', "")

            # Extract elevation
            elevation = site['siteInfo'].get('elevation_m', None)
            hs_json["elevation"] = float(elevation) if elevation else 0.0

            # Extract country from siteProperty if available
            hs_json["country"] = "No Data was Provided"
            site_properties = site['siteInfo'].get('siteProperty', [])
            if isinstance(site_properties, dict):
                site_properties = [site_properties]
            for prop in site_properties:
                if prop.get('@name') == 'Country':
                    hs_json["country"] = prop.get('#text', "No Data was Provided").strip()
                    break  # Assuming only one country property is needed

            # Add any additional fields as necessary
            hs_json["fullSiteCode"] = f"{hs_json.get('network', '')}:{hs_json.get('sitecode', '')}"
            hs_json["service"] = "SOAP"

            # Optional: Validate latitude and longitude
            if hs_json["latitude"] is None or hs_json["longitude"] is None:
                print(f"Invalid coordinates for site: {hs_json.get('sitename', 'Unknown')}")
                return None  # Skip sites with invalid coordinates

        except Exception as e:
            print(f"Error extracting site data: {e}")
            return None  # Skip this site if any error occurs during extraction

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
            response = await client.post(url, content=soap_envelope, headers=headers)
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


class AsyncSOAPClientCuahsi:
        def __init__(self):
            # You can store default headers or any other settings here
            pass
    
        async def get_sites_from_endpoint(self, url: str) -> AsyncGenerator[Dict[str, Any], None]:
            """
            Make an async SOAP request using httpx,
            stream the response to a temporary file using aiofiles,
            parse the XML response using xmltodict,
            and return an asynchronous generator that yields site dictionaries one by one.
            """
            # 1) Define your SOAP envelope
            soap_envelope = """<?xml version="1.0" encoding="utf-8"?>
                <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                            xmlns:xsd="http://www.w3.org/2001/XMLSchema"
                            xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
                    <soap:Body>
                        <GetSites xmlns="http://www.cuahsi.org/waterML/1.1/">
                            <!-- Adjust parameters as needed -->
                            <site>[:]</site> 
                        </GetSites>
                    </soap:Body>
                </soap:Envelope>
            """

            # 2) Define SOAPAction and other headers
            headers = {
                "Content-Type": "text/xml; charset=utf-8",
                "SOAPAction": "http://www.cuahsi.org/waterML/1.1/GetSites"
            }

            # 3) Create a temporary file to store the streamed response
            temp_file_path = None
            
            # Create a temporary file
            temp_file = tempfile.NamedTemporaryFile(delete=False, mode='wb')
            temp_file_path = temp_file.name
            temp_file.close()  # Close the file so aiofiles can open it asynchronously
            print(temp_file_path)
            # 4) Make an async POST request and stream the response
            async with httpx.AsyncClient() as client:
                try:
                    async with client.stream('POST', url, content=soap_envelope, headers=headers, timeout=None) as response:
                        response.raise_for_status()
                        async with aiofiles.open(temp_file_path, mode='wb') as tmp_file:
                            async for chunk in response.aiter_bytes(chunk_size=4096):
                                print(chunk)
                                await tmp_file.write(chunk)
                except httpx.RequestError as e:
                    # Handle network-related errors
                    print(f"An error occurred while requesting {e.request.url!r}: {e}")
                    return  # Yield nothing if request fails
                except httpx.HTTPStatusError as e:
                    # Handle non-2xx responses
                    print(f"Error response {e.response.status_code} while requesting {e.request.url!r}")
                    return  # Yield nothing if response is invalid

            # 5) Read the temporary file content asynchronously
            try:
                async with aiofiles.open(temp_file_path, mode='r', encoding='utf-8') as tmp_file:
                    response_text = await tmp_file.read()
            except Exception as e:
                print(f"Error reading temporary SOAP response file: {e}")
                return  # Yield nothing if reading fails
            finally:
                # 6) Remove the temporary file
                if temp_file_path and os.path.exists(temp_file_path):
                    os.remove(temp_file_path)

            # 7) Parse the SOAP XML body using xmltodict
            try:
                # Convert XML to OrderedDict
                xml_dict = xmltodict.parse(response_text)
            except Exception as e:
                # Handle parsing errors
                print(f"Error parsing SOAP response: {e}")
                return  # Yield nothing if parsing fails

            # 8) Extract the GetSitesResult content
            try:
                get_sites_result_text = xml_dict['soap:Envelope']['soap:Body']['GetSitesResponse']['GetSitesResult']
                if not get_sites_result_text:
                    print("GetSitesResult is empty.")
                    return  # Yield nothing if GetSitesResult is empty
            except KeyError as e:
                print(f"Expected key not found in SOAP response: {e}")
                return  # Yield nothing if structure is unexpected

            # 9) Parse the GetSitesResult content (which is a string containing XML)
            try:
                sites_response_dict = xmltodict.parse(get_sites_result_text)
                sites_response = sites_response_dict.get('sitesResponse', {})
                sites = sites_response.get('site', [])

                # Ensure sites is a list
                if isinstance(sites, dict):
                    sites = [sites]
                elif not isinstance(sites, list):
                    print("Unexpected structure for sites.")
                    return  # Yield nothing if structure is unexpected

            except Exception as e:
                print(f"Error parsing GetSitesResult content: {e}")
                return  # Yield nothing if parsing fails

            # 10) Iterate over each site element and yield site dictionaries
            for site in sites:
                site_dict = self.parse_site(site)
                if site_dict:
                    yield site_dict

        def parse_site(self, site: Dict[str, Any]) -> Optional[Dict[str, Any]]:
            """
            Parses a single site dictionary from xmltodict and returns a standardized site dictionary.
            """
            hs_json = {}

            try:
                # Extract siteName
                site_name = site['siteInfo']['siteName']
                if isinstance(site_name, str):
                    hs_json["sitename"] = site_name.strip()
                else:
                    hs_json["sitename"] = "Unknown Site"

                # Extract latitude and longitude
                latitude = site['siteInfo']['geoLocation']['geogLocation']['latitude']
                longitude = site['siteInfo']['geoLocation']['geogLocation']['longitude']
                hs_json["latitude"] = float(latitude) if latitude else None
                hs_json["longitude"] = float(longitude) if longitude else None

                # Extract siteCode attributes and text
                site_code_info = site['siteInfo']['siteCode']
                hs_json["sitecode"] = site_code_info['#text'].strip() if site_code_info.get('#text') else ""
                hs_json["network"] = site_code_info.get('@network', "")
                hs_json["siteID"] = site_code_info.get('@siteID', "")

                # Extract elevation
                elevation = site['siteInfo'].get('elevation_m', None)
                hs_json["elevation"] = float(elevation) if elevation else 0.0

                # Extract country from siteProperty if available
                hs_json["country"] = "No Data was Provided"
                site_properties = site['siteInfo'].get('siteProperty', [])
                if isinstance(site_properties, dict):
                    site_properties = [site_properties]
                for prop in site_properties:
                    if prop.get('@name') == 'Country':
                        hs_json["country"] = prop.get('#text', "No Data was Provided").strip()
                        break  # Assuming only one country property is needed

                # Add any additional fields as necessary
                hs_json["fullSiteCode"] = f"{hs_json.get('network', '')}:{hs_json.get('sitecode', '')}"
                hs_json["service"] = "SOAP"

                # Optional: Validate latitude and longitude
                if hs_json["latitude"] is None or hs_json["longitude"] is None:
                    print(f"Invalid coordinates for site: {hs_json.get('sitename', 'Unknown')}")
                    return None  # Skip sites with invalid coordinates

            except Exception as e:
                print(f"Error extracting site data: {e}")
                return None  # Skip this site if any error occurs during extraction

            return hs_json