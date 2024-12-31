import logging
import httpx
import xml.etree.ElementTree as ET
from ..backend_actions import BackendActions
from sqlalchemy.ext.asyncio import AsyncSession
from typing import AsyncGenerator
from .resource_backend_handler import ResourceBackendHandler as RBH
from tethysapp.water_data_explorer.model.crud import create_his_catalog
from tethysapp.water_data_explorer.model.schemas import HISCatalogCreate
from pydantic import ValidationError

log = logging.getLogger(__name__)


class CatalogBackendHandler(RBH):
    # pass
    SEND_DATA_ACTION: BackendActions = BackendActions.GET_LIST_SERVICES
    SEND_IMPORT_CATALOG_ACTION: BackendActions = BackendActions.IMPORT_CATALOG
    SEND_GET_CATALOGS_ACTION: BackendActions = BackendActions.GET_LIST_CATALOGS
    UPDATABLE_PROPS = ['name', 'description', 'attributes', 'public', 'status']
    READONLY_ATTRS = ['files', 'file_database_id']

    @property
    def receiving_actions(self) -> dict[BackendActions, callable]:
        return {
            BackendActions.IMPORT_CATALOG: self.import_catalog,
            BackendActions.GET_LIST_SERVICES: self.get_catalog_services,
            BackendActions.GET_LIST_CATALOGS: self.get_catalogs,
        }

    async def get_catalog_services(self, event, action, data):
        # SOAP endpoint and action
        url = data.get("endpoint")
        soap_action = "http://www.cuahsi.org/his/1.1/ws/GetWaterOneFlowServiceInfo"

        # SOAP envelope
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
            if response.status_code == 200:
                # Parse the XML response
                root = ET.fromstring(response.text)
                namespaces = {'ns': 'http://hiscentral.cuahsi.org/20100205/'}

                # Find all ServiceInfo elements
                service_info_list = root.findall('.//ns:ServiceInfo', namespaces)

                services_json = []
                for si in service_info_list:
                    serv_url = si.find('ns:servURL', namespaces)
                    title = si.find('ns:Title', namespaces)
                    valuecount = si.find('ns:valuecount', namespaces)
                    sitecount = si.find('ns:sitecount', namespaces)
                    variablecount = si.find('ns:variablecount', namespaces)

                    # Extract text or None if element not found
                    serv_url_text = serv_url.text if serv_url is not None else None
                    title_text = title.text if title is not None else None
                    valuecount_text = valuecount.text if valuecount is not None else None
                    sitecount_text = sitecount.text if sitecount is not None else None
                    variablecount_text = variablecount.text if variablecount is not None else None

                    services_json.append({
                        "servURL": serv_url_text,
                        "Title": title_text,
                        "valuecount": valuecount_text,
                        "sitecount": sitecount_text,
                        "variablecount": variablecount_text
                    })

            else:
                services_json = {
                    "error": f"Failed to fetch data. Status code: {response.status_code}"
                }
        
        await self.send_action(self.SEND_DATA_ACTION, services_json)

    @RBH.action_handler
    async def import_catalog(self, event, action, data, session):
        """
        Imports a new catalog into the database and sends a Channels group message
        containing the catalog's ID, name, and services.
        """
        
        # 1) Validate the incoming data with Pydantic
        schema = HISCatalogCreate(**data)

        # 2) Create the record in the DB
        new_catalog = await create_his_catalog(session, schema)

        
        # 4) Send data to a Channels group, e.g., "catalog_updates"
        catalog_json = {   
            "id": new_catalog.id,
            "name": new_catalog.name,
            "services": data.get("services"),
        }
        
        await self.send_action(self.SEND_IMPORT_CATALOG_ACTION, catalog_json)

    @RBH.action_handler
    async def get_catalogs(self, event, action, data, session):
        """
        Fetch all HISCatalog rows, convert them (and their related services)
        to Pydantic using a generator, and send them out.
        """
        try:
            # 1) Get the async generator
            catalogs_generator = self.get_catalog_generator(session)
            
            # 2) Collect catalogs into a list
            catalogs_json = []
            async for catalog_json in catalogs_generator:
                catalogs_json.append(catalog_json)
            
            if not catalogs_json:
                raise ValueError("No HISCatalog records found.")
            
            # 3) Send them via your custom method
            await self.send_action(self.SEND_GET_CATALOGS_ACTION, catalogs_json)
        
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
    # async def get_catalogs(self, event, action, data, session):
        
        
    #     catalogs = await self.get_his_catalogs(session)
        
    #     pydantic_catalogs = [HISCatalogRead.model_validate(catalog) for catalog in catalogs]
        
        
    #     catalogs_json = [catalog.model_dump() for catalog in pydantic_catalogs]
        
    #     await self.send_action(self.SEND_GET_CATALOGS_ACTION, catalogs_json)
