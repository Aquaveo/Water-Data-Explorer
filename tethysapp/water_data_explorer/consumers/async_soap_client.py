import httpx
import xmltodict
import json
import uuid
from dataclasses import asdict
import xml.etree.ElementTree as ET

class AsyncSOAPClient:
    def __init__(self):
        # You can store default headers or any other settings here
        pass

    async def get_sites_from_endpoint(self, url):
        """
        Make an async SOAP request using httpx,
        parse the XML response manually with xmltodict,
        and return a generator that yields site objects one by one.
        """
        # 1) Define your SOAP envelope
        # Adjust the namespace, method name, and request body as needed
        soap_envelope = """
            <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                           xmlns:xsd="http://www.w3.org/2001/XMLSchema"
                           xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
                <soap:Body>
                    <GetSites xmlns="http://www.cuahsi.org/his/1.1/ws/">
                        <site>[:]</site> 
                        <!-- Adjust parameters as needed -->
                    </GetSites>
                </soap:Body>
            </soap:Envelope>
        """

        # 2) SOAPAction can be required by some SOAP endpoints
        # The value depends on the service’s WSDL definition
        headers = {
            "Content-Type": "text/xml; charset=utf-8",
            "SOAPAction": "http://www.cuahsi.org/his/1.1/ws/GetSites"
        }

        # 3) Make an async call using httpx
        async with httpx.AsyncClient() as client:
            response = await client.post(url, content=soap_envelope, headers=headers, timeout=30.0)
            response.raise_for_status()  # Raise an exception if request failed

            # 4) Now parse the SOAP XML body
            #    If the service returns raw XML, we can parse it via xmltodict
            root_dict = xmltodict.parse(response.text)

        # 5) Extract the site information from root_dict
        #    This depends on your SOAP response structure.
        #    For demonstration, assume something like:
        #      root_dict["soap:Envelope"]["soap:Body"]["GetSitesResponse"]["GetSitesResult"]
        #    Adjust the keys to match your actual response

        try:
            body = root_dict.get("soap:Envelope", {}).get("soap:Body", {})
            sites_response = body.get("GetSitesResponse", {})
            sites_result = sites_response.get("GetSitesResult", {})
        except AttributeError:
            # The structure may differ; add logging or error handling
            return

        # Suppose 'sites_result' is still an XML-like dict with site data
        # Convert it to JSON-friendly data
        sites_json = json.loads(json.dumps(sites_result))

        # 6) Now yield each site from parse_sites(...)
        #    parse_sites is a generator that yields dicts
        return self.parse_sites(sites_json)

    def parse_sites(self, sites_json):
        """
        A generator that yields site dicts from the SOAP response JSON.
        Adjust keys to match your actual data structure.
        """
        # For demonstration, assume structure is something like:
        # sites_json = {
        #   'site': [
        #       {'siteInfo': {...}},
        #       {'siteInfo': {...}},
        #        ...
        #   ]
        # }

        site_list = sites_json.get("site", [])
        if isinstance(site_list, dict):
            # Only one site in the response
            yield self._extract_site_dict(site_list)
        else:
            # Multiple sites
            for site_dict in site_list:
                yield self._extract_site_dict(site_dict)

    def _extract_site_dict(self, site_data):
        """
        Transform each site XML/JSON structure into a Python dict
        that you can use to create a CUAHSISite in your DB.
        """
        # Example keys. Adapt them to match your SOAP data.
        site_info = site_data.get("siteInfo", {})
        location = site_info.get("geoLocation", {}).get("geogLocation", {})

        hs_json = {
            "sitename": site_info.get("siteName", "Unknown Site"),
            "latitude": location.get("latitude", 0.0),
            "longitude": location.get("longitude", 0.0),
            "country": "No Data",
            "sitecode": None,
            "network": None,
            "siteID": None,
            # etc.
        }
        # You can parse siteCode, network, etc. if your SOAP contains them
        site_code_info = site_info.get("siteCode", {})
        if isinstance(site_code_info, dict):
            hs_json["sitecode"] = site_code_info.get("#text", "")
            hs_json["network"] = site_code_info.get("@network", "")
            hs_json["siteID"] = site_code_info.get("@siteID")

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