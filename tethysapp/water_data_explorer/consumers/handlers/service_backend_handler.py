import logging
from ..backend_actions import BackendActions
from .resource_backend_handler import ResourceBackendHandler as RBH
from tethysapp.water_data_explorer.model.crud import create_view
from tethysapp.water_data_explorer.model.schemas import  CUAHSIServiceCreate, CUAHSIServiceRead

log = logging.getLogger(__name__)


class ServiceViewBackendHandler(RBH):
    # pass
    SEND_DATA_ACTION: BackendActions = BackendActions.GET_VIEWS_FROM_CATALOG
    SEND_GET_VIEW: BackendActions = BackendActions.GET_VIEW
    SEND_IMPORT_VIEW: BackendActions = BackendActions.IMPORT_VIEW
    UPDATABLE_PROPS = ['name', 'description', 'attributes', 'public', 'status']
    READONLY_ATTRS = ['files', 'file_database_id']

    @property
    def receiving_actions(self) -> dict[BackendActions, callable]:
        return {
            BackendActions.IMPORT_VIEW: self.import_view,
            BackendActions.GET_VIEWS_FROM_CATALOG: self.get_views_from_catalog,
        }
    
    @RBH.action_handler
    async def import_view(self, event, action, data, session):
        """
        Imports a new catalog into the database and sends a Channels group message
        containing the catalog's ID, name, and services.
        """
        catalog_id = data.get("catalog_id")
        # 1) Validate the incoming data with Pydantic
        renamed_data = {
            "title": data.get("Title"),
            "url": data.get("servURL"),
            "description": data.get("servDesc",""),
            "sitecount": data.get("sitecount"),
            "valuecount": data.get("valuecount"),
            "variablecount": data.get("variablecount"),
            "countries": data.get("countries",""),
        }

        schema = CUAHSIServiceCreate(**renamed_data)

        # 2) Create the record in the DB
        new_view = await create_view(session,catalog_id,schema)

        view_json = {   
            "id": new_view.id,
            "name": new_view.title,
            "services": data.get("services"),
        }
        
        await self.send_action(self.SEND_IMPORT_VIEW, view_json)

    @RBH.action_handler
    async def get_view(self, event, action, data, session):
        view = await self.get_view(data,session)
        pydantic_view = CUAHSIServiceRead.model_validate(view)
        view_json = pydantic_view.model_dump()
        await self.send_action(self.SEND_GET_VIEW, view_json)

    @RBH.action_handler
    async def get_views(self, event, action, data, session):
        views = await self.get_views_from_catalog(data,session)
        
        pydantic_views = [CUAHSIServiceRead.model_validate(view) for view in views]
        
        views_json = [view.model_dump() for view in pydantic_views]
        
        await self.send_action(self.SEND_DATA_ACTION, views_json)
