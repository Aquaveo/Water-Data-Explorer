import logging
from ..backend_actions import BackendActions
from .resource_backend_handler import ResourceBackendHandler as RBH
from tethysapp.water_data_explorer.model.crud import create_site
from tethysapp.water_data_explorer.model.schemas import  CUAHSISiteCreate, CUAHSISiteRead
from pydantic import ValidationError
from suds.client import Client
import xmltodict
import json
from suds.sudsobject import asdict
from ..async_soap_client import AsyncSOAPClient
log = logging.getLogger(__name__)


class SitesBackendHandler(RBH):
    # pass
    SEND_DATA_ACTION: BackendActions = BackendActions.GET_SITES
    SEND_IMPORT_SITES: BackendActions = BackendActions.IMPORT_SITES
    SEND_GET_SITE: BackendActions = BackendActions.GET_SITE

    @property
    def receiving_actions(self) -> dict[BackendActions, callable]:
        return {
            BackendActions.IMPORT_SITES: self.create_sites,
            BackendActions.GET_SITES: self.get_sites,
            BackendActions.GET_SITE: self.get_site,
        }
    
    @RBH.action_handler
    async def create_sites(self, event, action, data, session):
        """
        1) Fetch sites from the SOAP endpoint (as an asynchronous generator of dicts).
        2) For each site, build a Pydantic schema and create a CUAHSISite in DB.
        3) Send each site info or batch them into one response.
        """

        view_id = data.get("view_id")  # e.g., a UUID that matches service_id
        url = data.get("url") + "?request=GetSitesObject&format=WML1"

        # (A) Instantiate AsyncSOAPClient and get the asynchronous generator
        async_soap_client = AsyncSOAPClient()

        try:
            # Fetch sites as an asynchronous generator
            sites_gen = async_soap_client.get_sites_from_endpoint(url)  # Removed 'await'
            breakpoint()
        except Exception as e:
            log.error(f"Failed to initiate site fetching: {e}")
            error_payload = {"error": f"Failed to fetch sites: {str(e)}"}
            await self.send_action(self.SEND_IMPORT_SITES, error_payload)
            return

        # Option 1: Accumulate sites to send as a single batch
        created_sites_info = {
            "view_id": view_id,
            "catalog_id": data.get("catalog_id"),
            "sites": [],
        }

        # Iterate over the asynchronous generator using 'async for'
        async for site_dict in sites_gen:
            # Validate and create Pydantic schema
            try:
                schema = CUAHSISiteCreate(
                    title=site_dict["sitename"],
                    code=site_dict["sitecode"],
                    description="",  # You can adjust as needed
                    latitude=site_dict["latitude"],
                    longitude=site_dict["longitude"],
                    elevation=0,  # or parse from site_dict if you have it
                    countries=site_dict["country"],
                )
            except ValidationError as ve:
                log.error(f"Pydantic validation error for site {site_dict}: {ve}")
                continue  # Skip this site if validation fails
            except KeyError as ke:
                log.error(f"Missing key in site data {site_dict}: {ke}")
                continue  # Skip this site if required keys are missing

            # Create site in DB
            try:
                new_site = await create_site(session, view_id, schema)
            except Exception as e:
                log.error(f"Error creating site {schema.title}: {e}")
                continue  # Skip this site if creation fails

            # Build the JSON for your message (adjust as needed)
            site_json = {
                "id": str(new_site.id),
                "name": new_site.title,
                "latitude": new_site.latitude,
                "longitude": new_site.longitude,
                "countries": new_site.countries,
                "elevation": new_site.elevation,
                "variables": data.get("variables", []),
            }

            # Option 1A: Accumulate to send a single batch
            created_sites_info['sites'].append(site_json)

            # Option 1B: If you prefer sending each site individually:
            # await self.send_action(self.SEND_IMPORT_SITES, site_json)

        # If batching, send them once at the end
        if created_sites_info['sites']:
            await self.send_action(self.SEND_IMPORT_SITES, created_sites_info)
        else:
            # Optionally, send a message indicating no sites were processed
            log.info("No sites were imported.")
            await self.send_action(self.SEND_IMPORT_SITES, {"message": "No sites were imported."})

    @RBH.action_handler
    async def get_site(self, event, action, data, session):
        site = await self.get_site(data,session)
        pydantic_site = CUAHSISiteRead.model_validate(site)
        site_json = pydantic_site.model_dump()
        await self.send_action(self.SEND_GET_SITE, site_json)

    @RBH.action_handler
    async def get_sites(self, event, action, data, session):
        """
        Fetch all CUAHSISite rows, convert them (and their related Variables)
        to Pydantic using a generator, and send them out.
        """
        try:
            sites_generator = self.get_sites_generator(session)
            sites_json = []
            async for site_json in sites_generator:
                sites_json.append(site_json)
            
            if not sites_json:
                raise ValueError("No Sites records found.")
            
            await self.send_action(self.SEND_DATA_ACTION, sites_json)
        
        except ValidationError as e:
            msg = f"Validation error: {e}"
            await self.send_error(msg, action, data, {'errors': e.errors()})
            log.debug(msg)
        except ValueError as e:
            msg = str(e)
            await self.send_error(msg, action, data, {})
            log.debug(msg)
        except Exception as e:
            msg = f"Unexpected error: {str(e)}"
            await self.send_error(msg, action, data, {})
            log.exception(msg)















    # @RBH.action_handler
    # async def create_sites(self, event, action, data, session):
    #     """
    #     1) Fetch sites from the SOAP endpoint (as a generator of dicts).
    #     2) For each site, build a Pydantic schema and create a CUAHSISite in DB.
    #     3) Send each site info or batch them into one response.
    #     """
        
    #     view_id = data.get("view_id")  # e.g. a UUID that matches service_id
    #     url = data.get("url") + "?WSDL"

    #     # (A) Get the generator of site dicts from the SOAP endpoint
    #     sites_gen = await self.get_sites_from_endpoint(url)

    #     # Option 1: Send them all at once
    #     created_sites_info = {
    #         "view_id": view_id,
    #         "catalog_id": data.get("catalog_id"),
    #         "sites": [],
    #     }
        
    #     for site_dict in sites_gen:
    #         # Build the Pydantic schema from the site dict
    #         # Make sure your keys match what's in site_dict
    #         schema = CUAHSISiteCreate(
    #             title=site_dict["sitename"],
    #             code=site_dict["sitecode"],
    #             description="",
    #             latitude=float(site_dict["latitude"]),
    #             longitude=float(site_dict["longitude"]),
    #             elevation=0,  # or parse from site_dict if you have it
    #             countries=site_dict["country"],
    #         )

    #         # Create site in DB
    #         new_site = await create_site(session, view_id, schema)

    #         # Build the JSON for your message (adjust as needed)
    #         site_json = {
    #             "id": str(new_site.id),
    #             "name": new_site.title,
    #             "latitude": new_site.latitude,
    #             "longitude": new_site.longitude,
    #             "countries": new_site.countries,
    #             "elevation": new_site.elevation,
    #             "variables": data.get("variables", []),
    #         }

    #         # Option 1A: Accumulate to send a single batch
    #         created_sites_info['sites'].append(site_json)

    #         # Option 1B: If you prefer sending each site individually:
    #         # await self.send_action(self.SEND_IMPORT_VIEW, site_json)

    #     # If batching, send them once at the end
    #     if created_sites_info['sites']:
    #         await self.send_action(self.SEND_IMPORT_VIEW, created_sites_info)


    # async def get_sites_from_endpoint(self, url):
    #     """Yield sites one by one from the given endpoint."""
        
    #     client = Client(url, timeout=500)
    #     sites = client.service.GetSites("[:]")  # SOAP call
    #     if isinstance(sites, str):
    #         # Possibly an XML string
    #         sites_dict = xmltodict.parse(sites)
    #         sites_json = json.loads(json.dumps(sites_dict))
    #     else:
    #         sites_json = json.loads(json.dumps(self.recursive_asdict(sites)))
        
    #     # Now 'sites_json' is a Python dict.
    #     # parseJSON is a generator function, so we can just return it.
    #     return self.parseJSON(sites_json)

    # def recursive_asdict(self, d):
    #     """Convert a Suds/Zeep SOAP object into a dict recursively."""
    #     out = {}
    #     for k, v in asdict(d).items():
    #         if hasattr(v, "__keylist__"):
    #             out[k] = self.recursive_asdict(v)
    #         elif isinstance(v, list):
    #             out[k] = []
    #             for item in v:
    #                 if hasattr(item, "__keylist__"):
    #                     out[k].append(self.recursive_asdict(item))
    #                 else:
    #                     out[k].append(item)
    #         else:
    #             out[k] = v
    #     return out



    # def parseJSON(self, json_data):
    #     """
    #     A generator function that yields site dictionaries one by one,
    #     instead of returning a full list of sites.
    #     """
    #     if "sitesResponse" not in json_data:
    #         print("Response does not contain 'sitesResponse'.")
    #         return  # yield nothing

    #     sites_object = json_data["sitesResponse"].get("site")

    #     if not sites_object:
    #         return

    #     # If the SOAP response has multiple sites, sites_object is a list
    #     if isinstance(sites_object, list):
    #         for site in sites_object:
    #             yield self._extract_site_dict(site)
    #     else:
    #         # If there is only one site, sites_object is a dict
    #         yield self._extract_site_dict(sites_object)


    # def _extract_site_dict(self, site):
    #     """
    #     Helper function that extracts and returns the site dictionary.
    #     """
    #     hs_json = {}
    #     latitude = site["siteInfo"]["geoLocation"]["geogLocation"]["latitude"]
    #     longitude = site["siteInfo"]["geoLocation"]["geogLocation"]["longitude"]
    #     site_name = site["siteInfo"]["siteName"]
    #     network = site["siteInfo"]["siteCode"]["@network"]
    #     sitecode = site["siteInfo"]["siteCode"]["#text"]
    #     siteID = site["siteInfo"]["siteCode"]["@siteID"]
        
    #     # Default country
    #     hs_json["country"] = "No Data was Provided"

    #     # Attempt to parse siteProperty info for "Country"
    #     try:
    #         site_property_info = site["siteInfo"]["siteProperty"]
    #         # site_property_info might be a list or a dict
    #         if isinstance(site_property_info, list):
    #             for props in site_property_info:
    #                 if props["@name"] == "Country":
    #                     hs_json["country"] = props["#text"]
    #         else:
    #             # single property
    #             if str(site_property_info["@name"]) == "Country":
    #                 hs_json["country"] = str(site_property_info["#text"])
    #     except Exception:
    #         pass  # Already has default

    #     # Convert site_name to a Python 3 string if needed
    #     if isinstance(site_name, bytes):
    #         site_name = site_name.decode("utf-8")
    #     else:
    #         site_name = str(site_name)

    #     # Populate hs_json
    #     hs_json["sitename"] = site_name
    #     hs_json["latitude"] = latitude
    #     hs_json["longitude"] = longitude
    #     hs_json["sitecode"] = sitecode
    #     hs_json["network"] = network
    #     hs_json["fullSiteCode"] = network + ":" + sitecode
    #     hs_json["siteID"] = siteID
    #     hs_json["service"] = "SOAP"

    #     return hs_json
    
