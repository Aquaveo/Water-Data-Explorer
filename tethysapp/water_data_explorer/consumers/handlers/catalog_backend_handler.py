import logging
import httpx
import xml.etree.ElementTree as ET
from ..backend_actions import BackendActions
from .resource_backend_handler import ResourceBackendHandler as RBH

log = logging.getLogger(__name__)


class CatalogBackendHandler(RBH):
    # pass
    SEND_DATA_ACTION: BackendActions = BackendActions.GET_LIST_SERVICES
    UPDATABLE_PROPS = ['name', 'description', 'attributes', 'public', 'status']
    READONLY_ATTRS = ['files', 'file_database_id']

    @property
    def receiving_actions(self) -> dict[BackendActions, callable]:
        return {
            # BackendActions.CATALOG_DATA: self.get_catalog_services,
            BackendActions.IMPORT_CATALOG: self.get_catalog_services,
            BackendActions.GET_LIST_SERVICES: self.get_catalog_services,
        }

    # async def get_catalog_services(self, event, action, data, session):
    #     """Get the catalog services."""
    #     services_json = {} #implement your logic here
    #     await self.send_action(self.SEND_DATA_ACTION, services_json)


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


    # @RBH.action_handler
    # async def receive_data(self, event, action, data, session):
    #     project = await self.get_project(session)
    #     log.debug(f'Sending project data for project with ID "{project.id}"')
    #     await self.send_data(session, project, action.get('id'))

    # @RBH.action_handler
    # async def receive_update(self, event, action, data, session):
    #     """Handle received update project messages."""
    #     project = await self.get_project(session)

    #     def _update_project(session, project, data):
    #         log.debug(f'Updating project with ID: "{project.id}" with "{data}"')
    #         for prop, val in data.items():
    #             if prop not in self.UPDATABLE_PROPS:
    #                 continue

    #             if prop == 'attributes':
    #                 for attr, aval in val.items():
    #                     if attr in self.READONLY_ATTRS:
    #                         continue
    #                     project.set_attribute(attr, aval)
    #             elif prop == 'status':
    #                 if val not in project.valid_statuses():
    #                     log.warning(f'Invalid status "{val}" for Project with ID: "{project.id}", skipping...')
    #                     continue
    #                 project.set_status(status=val)
    #             else:
    #                 # Only set properties that exist on the project
    #                 if getattr(project, prop, self.PROP_DNE) != self.PROP_DNE:
    #                     log.debug(f'Setting property "{prop}" to "{val}"')
    #                     setattr(project, prop, val)
    #         session.commit()

    #     await session.run_sync(_update_project, project, data)
    #     log.debug(f'Successfully updated project with ID: "{project.id}"')
    #     await self.send_data(session, project, action.get('id'))
