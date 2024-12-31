import logging
from collections import namedtuple
from aiopath import AsyncPath
from asgiref.sync import sync_to_async
from channels.db import database_sync_to_async
from pydantic import ValidationError
from ..backend_actions import BackendActions
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import select
from typing import AsyncGenerator,List

from tethysapp.water_data_explorer.model.cuahsi import HISCatalog,CUAHSIService
from tethysapp.water_data_explorer.model.schemas import HISCatalogRead,CUAHSIServiceRead


from tethysapp.water_data_explorer.app import App

log = logging.getLogger(__name__)


class ResourceBackendHandler:
    SEND_DATA_ACTION: BackendActions = None
    PROP_DNE = '###prop-doesnt-exist###'  # For getattr checks where None value is valid

    def __init__(self, backend_consumer):
        self.backend_consumer = backend_consumer
        self.sessionmaker = backend_consumer.sessionmaker

    @property
    def receiving_actions(self) -> dict[BackendActions, callable]:
        raise NotImplementedError("The receiving_actions property must be implemented by the subclass.")

    def action_handler(method):
        """Decorator method to automatically handle sqlalchemy async session and errors."""
        async def _action_handler(self, event, action, data):
            async with self.sessionmaker() as session:
                try:
                    await method(self, event, action, data, session)
                except ValidationError as e:
                    msg = (f'Validation error occurred while handling {action.get("type")} '
                        f'action "{action.get("id")}": {e}')
                    await self.send_error(msg, action, data, {'errors': e.errors()})
                    log.debug(msg)
                except ValueError as e:
                    msg = str(e)
                    await self.send_error(msg, action, data, {})
                    log.debug(msg)
                except Exception as e:
                    msg = (f'An unexpected error occurred while handling action "{action}": {str(e)}')
                    await self.send_error(msg, action, data, {})
                    log.exception(msg)
        return _action_handler

    async def get_his_catalogs(self, session: AsyncSession) -> List[HISCatalog]:
        """
        Fetch all HISCatalog records with their related services loaded.
        """
        result = await session.execute(
            select(HISCatalog).options(selectinload(HISCatalog.services))
        )
        catalogs = result.scalars().all()  # Fetch all results as a list
        return catalogs


    async def get_catalog_generator(self, session: AsyncSession) -> AsyncGenerator[dict, None]:
        """
        Async generator that yields each HISCatalog as a Pydantic dict,
        including its related services (views).
        """
        catalogs = await self.get_his_catalogs(session)  # Await the list of catalogs
        
        for catalog in catalogs:  # Use regular for loop
            # Convert HISCatalog to Pydantic
            catalog_read = HISCatalogRead.model_validate(catalog)
            
            # Convert related CUAHSIService to Pydantic
            service_reads = [CUAHSIServiceRead.model_validate(service) for service in catalog.services]
            catalog_read.views = service_reads
            
            # Yield as dict
            yield catalog_read.model_dump()

    async def get_catalog(self,data,session) -> HISCatalog:
        """Get a single HISCatalog record by ID."""
        catalog_id = data.get('id')

        def _query(session, catalog_id):
            return session.query(HISCatalog).get(catalog_id)

        catalog = await session.run_sync(_query, catalog_id=catalog_id)
        if not catalog:
            raise ValueError(f'Could not find HIS Catalog with ID "{catalog_id}"')
        return catalog
    
    async def get_view(self,data,session) -> CUAHSIService:
        """Get a single CUAHSIService record by ID."""
        view_id = data.get('id')

        def _query(session, view_id):
            return session.query(CUAHSIService).get(view_id)

        view = await session.run_sync(_query, view_id=view_id)
        if not view:
            raise ValueError(f'Could not find HIS Catalog with ID "{view_id}"')
        return view


    async def get_views_from_catalog(self, event, action, data, session) -> list[CUAHSIService]:
        """Get all views from a catalog."""
        catalog = await self.get_catalog(data, session)
        views = catalog.views
        return views
    
    async def send_action(self, action: BackendActions, payload: dict):
        print('send_action')
        await self.backend_consumer.send_action(action, payload)

    async def send_data(self, session, resource: HISCatalog | list[HISCatalog] | CUAHSIService | list[CUAHSIService] , from_action: str):
        if not self.SEND_DATA_ACTION:
            log.error(f'No SEND_DATA_ACTION defined for "{self.__class__.__name__}".')
            raise NotImplementedError("The send_data_action property must be implemented by the subclass.")

        def _serialize(_, resource):
            # Add metadata for frontend
            if from_action:
                resource.set_attribute('fromAction', str(from_action))

            # Resource.serialize ends calls lazy loaded properties (e.g. Resource.organizations)
            return resource.serialize()

        data_json = await session.run_sync(_serialize, resource=resource)

        await self.send_action(self.SEND_DATA_ACTION, data_json)

    async def send_acknowledge(self, msg: str, action: BackendActions, payload: dict, details: dict = None):
        """Convenience wrapper for consumer send_acknowledge()."""
        await self.backend_consumer.send_acknowledge(msg, action, payload, details)

    async def send_error(self, msg: str, action: dict, payload: dict, details: dict = None):
        """Convenience wrapper for consumer send_error()."""
        await self.backend_consumer.send_error(msg, action, payload, details)

    async def set_status(self, session, resource, status):
        """Set the status of a Resource and commit the session.
        Args:
            session (Session): SQLAlchemy session.
            resource (Resource): Resource to set the status for.
            status (str): Status to set on the resource.
        """
        def _set_status(s, resource, status):
            resource.set_status(status=status)
            s.commit()

        await session.run_sync(_set_status, resource=resource, status=status)





    # async def get_his_catalogs(self, session) -> list[HISCatalog]:
    #     """Get all records from the HISCatalog model."""
        
    #     def _query(session):
    #         return (
    #             session.query(HISCatalog)
    #             .options(selectinload(HISCatalog.services))
    #             .all()
    #         )
    #     catalogs = await session.run_sync(_query)
    #     if not catalogs:
    #         raise ValueError('No HISCatalog records found.')
    #     return catalogs
