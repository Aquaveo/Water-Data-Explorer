# cuahsi_backend_handler.py
import logging
import asyncio
from pydantic import ValidationError
from sqlalchemy.ext.asyncio import AsyncSession

from ..backend_actions import BackendActions
from .resource_backend_handler import ResourceBackendHandler as RBH
from ..async_soap_client import AsyncSOAPClient

from tethysapp.water_data_explorer.schemas import (
    CUAHSISiteCreate, 
    CUAHSISiteRead,
    CUAHSIDataStreamRead
)

from tethysapp.water_data_explorer.model import CUAHSISite
from typing import List

logger = logging.getLogger(__name__)


class CuahsiBackendHandler(RBH):
    
    SEND_DATA_ACTION: BackendActions = BackendActions.IMPORT_SITES_FROM_CATALOG
    SEND_LIST_SERVICES_ACTION: BackendActions = BackendActions.GET_LIST_SERVICES
    SEND_GET_IMPORTED_CUAHSI_SITES = BackendActions.GET_IMPORTED_CUAHSI_SITES
    SEND_GET_SITE_INFO = BackendActions.GET_SITE_INFO
    @property
    def receiving_actions(self) -> dict[BackendActions, callable]:
        return {
            BackendActions.IMPORT_SITES_FROM_CATALOG: self.import_sites_from_catalog,
            BackendActions.GET_LIST_SERVICES: self.get_catalog_services,
        }

    async def get_catalog_services(self, event, action, data):
        """
        Handler to fetch catalog services via SOAP and send them to the frontend.
        """
        
        url = data.get("endpoint")
        async_soap_client = AsyncSOAPClient()
        
        try:
            # Fetch services as an asynchronous generator
            services_generator = await async_soap_client.get_catalog_services(url)
            
            # Collect services into a list using async for
            services_json = [service async for service in services_generator]
        except Exception as e:
            # Handle exceptions gracefully
            error_payload = {"error": str(e)}
            await self.send_action(self.SEND_LIST_SERVICES_ACTION, error_payload)
            return

        # Send the collected services
        await self.send_action(self.SEND_LIST_SERVICES_ACTION, services_json)

    async def create_sites_bulk(
        self,
        db: AsyncSession,
        sites_in: List[CUAHSISiteCreate]
    ) -> List[CUAHSISite]:
        """
        Create multiple CUAHSISite records in bulk.

        Args:
            db (AsyncSession): The async database session.
            sites_in (List[CUAHSISiteCreate]): A list of site creation schemas.

        Returns:
            List[CUAHSISite]: The newly inserted CUAHSISite ORM objects.
        """
        # Convert Pydantic schemas into ORM objects
        sites = []
        for site_data in sites_in:
            site_orm = CUAHSISite(
                name=site_data.name,
                code=site_data.code,
                description=site_data.description,
                latitude=site_data.latitude,
                longitude=site_data.longitude,
                tags=site_data.tags,
                country=site_data.country,
                elevation=site_data.elevation,
                
                # If your schema has service_url (and your model has it too):
                service_url=site_data.service_url,
            )
            sites.append(site_orm)

        # Add & commit
        db.add_all(sites)
        try:
            await db.commit()
            # Refresh each site to load generated IDs, etc.
            for site in sites:
                await db.refresh(site)
            logger.info(f"Successfully inserted {len(sites)} CUAHSISite records.")
        except Exception as e:
            await db.rollback()
            logger.error(f"Bulk insert failed: {e}")
            raise e

        return sites

    async def import_sites_from_catalog(self, event, action, data):
        """
        Instead of using the "session" injected by the decorator here,
        we ignore it (hence the _session unused parameter) 
        and open new sessions for each parallel task.
        """
        services = data.get("services", [])
        tags = data.get("tags", [])

        tasks = []
        for service in services:
            # Build the data
            new_data = {
                "url": service.get("servURL"),
                "sitecount": service.get("sitecount", 0),
                "tags": tags
            }
            # Schedule a concurrent task
            task = asyncio.create_task(
                self._import_single_service(event, action, new_data)
            )
            tasks.append(task)

        # Wait for all tasks (services) to complete
        await asyncio.gather(*tasks,return_exceptions=True)

    @RBH.single_service_action_handler
    async def _import_single_service(self, event, action, data,session):
        """
        Each import task gets its own session to avoid conflicts.
        """
        # async with self.sessionmaker() as session:
        #     # Reuse the create_cuahsi_sites method with a dedicated session
        await self.create_cuahsi_sites(event, action, data, session)


    async def create_cuahsi_sites(self, event, action, data,session):
        """
        1) Fetch site info from the SOAP endpoint (async generator).
        2) For each batch, validate + create CUAHSISite records in bulk.
        3) Send each batch of created sites as a response.
        """
        base_url = data.get("url")
        tags = data.get("tags")
        site_count = data.get("sitecount", 0)
        sites_upload_count = 0

        params = {"request": "GetSitesObject", "format": "WML1"}
        url = f"{base_url}?request={params['request']}&format={params['format']}"

        async_soap_client = AsyncSOAPClient()

        try:
            # yields batches of site dicts
            sites_gen = async_soap_client.get_sites_from_endpoint(url, site_count)
        except Exception as e:
            logger.error(f"Failed to initiate site fetching: {e}")
            error_payload = {
                "sites": [],
                "error": f"Failed to fetch sites: {str(e)}"
            }
            await self.send_action(self.SEND_GET_IMPORTED_CUAHSI_SITES, error_payload)
            return

        async for batch in sites_gen:
            if not batch:
                continue

            # Convert site dicts -> new CUAHSISiteCreate schema
            try:
                sites_in = [
                    CUAHSISiteCreate(
                        # The new schema uses 'name' instead of 'title'
                        name=site_dict.get("sitename", "Unknown Site"),
                        code=site_dict.get("sitecode", ""),
                        description="",  
                        latitude=site_dict.get("latitude"),
                        longitude=site_dict.get("longitude"),
                        country=site_dict.get("country", "No Data Provided"),
                        elevation=site_dict.get("elevation", 0.0),
                        tags=tags,
                        service_url=base_url,
                    )
                    for site_dict in batch
                ]
            except ValidationError as ve:
                logger.error(f"Pydantic validation error in batch: {ve}")
                continue

            # Insert in bulk (now in resource_backend_handler.py)
            try:
                inserted_sites = await self.create_sites_bulk(session, sites_in)
            except Exception as e:
                logger.error(f"Bulk insert failed for batch: {e}")
                continue

            sites_json = []
            for site in inserted_sites:
                try:
                    pydantic_site = CUAHSISiteRead.model_validate(site)
                    site_data = pydantic_site.model_dump()
                    sites_json.append(site_data)
                except ValidationError as ve:
                    logger.error(f"Pydantic validation error for site ID {site.id}: {ve}")
                    continue
            
            sites_upload_count += len(sites_json)
            created_sites_info = {
                "sites": sites_json
            }
            
            await self.send_action(self.SEND_GET_IMPORTED_CUAHSI_SITES, created_sites_info)
            logger.info(f"Sent batch of {len(sites_json)} sites.")

        logger.info("Completed processing all site batches.")


    async def get_cuahsi_site_info(self, data):
        base_url = data.get("service_url")
        site_code = data.get("code")
        params = {"request": "GetSiteInfoObject","site_code": site_code , "format": "WML1"}
        url = f"{base_url}?request={params['request']}&site={params['site_code']}&format={params['format']}"
        async_soap_client = AsyncSOAPClient()
        try:
            # sites_info_series = await async_soap_client.get_site_info(url)
            sites_info_series = [record async for record in async_soap_client.get_site_info(url)]

            await self.send_action(self.SEND_GET_SITE_INFO, sites_info_series)

        except Exception as e:
            logger.error(f"Failed to get site info: {e}")
            error_payload = {
                "error": f"Failed to fetch sites: {str(e)}"
            }
            await self.send_action(self.SEND_GET_SITE_INFO, error_payload)
            
