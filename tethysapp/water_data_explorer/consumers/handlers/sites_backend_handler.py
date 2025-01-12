from __future__ import annotations

import logging
from typing import Dict, Any, List

from pydantic import ValidationError
from sqlalchemy.ext.asyncio import AsyncSession
from ..backend_actions import BackendActions
from .resource_backend_handler import ResourceBackendHandler as RBH


logger = logging.getLogger(__name__)


class SitesBackendHandler(RBH):
    SEND_DATA_ACTION: BackendActions = BackendActions.GET_SITES
    SEND_GET_SITE: BackendActions = BackendActions.GET_SITE

    @property
    def receiving_actions(self) -> dict[BackendActions, callable]:
        return {
            BackendActions.GET_SITE: self.get_site,
            BackendActions.GET_SITES: self.handle_get_sites,
        }

    @RBH.action_handler
    async def handle_get_sites(
        self,
        event: dict[str, Any],
        action: dict[str, Any],
        data: dict[str, Any],
        session: AsyncSession
    ) -> None:
        """
        Fetch all CUAHSISite rows, convert them (and their related variables)
        to Pydantic using a generator, and send them out.
        """

        try:
            # get_sites_generator is defined in ResourceBackendHandler
            sites_generator = self.get_sites_generator(session)
            sites_json: List[dict[str, Any]] = []
            async for site_json in sites_generator:
                sites_json.append(site_json)
            
            if not sites_json:
                raise ValueError("No Sites records found.")
            
            
            # Send them back with SEND_DATA_ACTION
            await self.send_action(self.SEND_DATA_ACTION, sites_json)
        
        except ValidationError as e:
            msg = f"Validation error: {e}"
            await self.send_error(msg, action, data, {'errors': e.errors()})
            logger.debug(msg)
        except ValueError as e:
            msg = str(e)
            await self.send_error(msg, action, data, {})
            logger.debug(msg)
        except Exception as e:
            msg = f"Unexpected error: {str(e)}"
            await self.send_error(msg, action, data, {})
            logger.exception(msg)

    @RBH.action_handler
    async def create_sites(
        self,
        event: dict[str, Any],
        action: dict[str, Any],
        data: dict[str, Any],
        session: AsyncSession
    ) -> None:
        """
        Example placeholder for creating sites from user input, if needed.
        You might already have 'create_cuahsi_sites' in 'cuahsi_backend_handler'.
        """
        logger.info("create_sites not implemented yet.")
        # Implement your logic here
        pass


    # @RBH.action_handler
    # async def create_sites(self, event, action, data, session):
    #     """
    #     1) Fetch sites from the SOAP endpoint (as an asynchronous generator of batches of dicts).
    #     2) For each batch, validate and create CUAHSISite records in bulk.
    #     3) Send each batch of created sites as a response.
    #     """
    #     view_id = data.get("view_id")  # e.g., a UUID that matches service_id
    #     base_url = data.get("url")
    #     site_count = data.get("sitecount", 0)

    #     params = {
    #         "request": "GetSitesObject",
    #         "format": "WML1"
    #     }
    #     url = f"{base_url}?request={params['request']}&format={params['format']}"

    #     # (A) Instantiate AsyncSOAPClient and get the asynchronous generator
    #     async_soap_client = AsyncSOAPClient()

    #     try:
    #         # Fetch sites as an asynchronous generator yielding batches
    #         sites_gen = async_soap_client.get_sites_from_endpoint(url,site_count)
    #     except Exception as e:
    #         logger.error(f"Failed to initiate site fetching: {e}")
    #         error_payload = {"error": f"Failed to fetch sites: {str(e)}"}
    #         await self.send_action(self.SEND_IMPORT_SITES, error_payload)
    #         return

    #     # Iterate over the asynchronous generator using 'async for'
    #     async for batch in sites_gen:
    #         if not batch:
    #             continue  # Skip empty batches

    #         # Convert site dicts to CUAHSISiteCreate schemas
    #         try:
    #             sites_in = [
    #                 CUAHSISiteCreate(
    #                     title=site_dict.get("sitename", "Unknown Site"),
    #                     code=site_dict.get("sitecode", ""),
    #                     description="",  # Adjust as needed
    #                     latitude=site_dict.get("latitude"),
    #                     longitude=site_dict.get("longitude"),
    #                     elevation=site_dict.get("elevation", 0.0),
    #                     countries=site_dict.get("country", "No Data was Provided"),
    #                     service_id=site_dict.get("service_id"),  # Include service_id
    #                 )
    #                 for site_dict in batch
    #             ]
    #         except ValidationError as ve:
    #             logger.error(f"Pydantic validation error in batch: {ve}")
    #             # Optionally, send error details or skip the entire batch
    #             continue

    #         # Insert sites in bulk
    #         try:
    #             inserted_sites = await create_sites_bulk(session, view_id, sites_in)
    #         except Exception as e:
    #             logger.error(f"Bulk insert failed for batch: {e}")
    #             # Optionally, send error details or skip the entire batch
    #             continue

    #         # Prepare the JSON payload for the inserted sites
    #         sites_json = []
    #         for site in inserted_sites:
    #             try:
    #                 pydantic_site = CUAHSISiteRead.model_validate(site)
    #                 variables_reads = [
    #                     CUAHSIVariableRead.model_validate(variable) for variable in site.variables
    #                 ]
    #                 pydantic_site.variables = variables_reads
    #                 site_data = pydantic_site.model_dump()
    #                 # Include service_id and catalog_id if needed
    #                 site_data["service_id"] = str(site.service_id)
    #                 site_data["catalog_id"] = str(site.service.catalog_id) if site.service else None
    #                 sites_json.append(site_data)
    #             except ValidationError as ve:
    #                 logger.error(f"Pydantic validation error for site ID {site.id}: {ve}")
    #                 continue

    #         # Prepare the batch response
    #         created_sites_info = {
    #             "view_id": view_id,
    #             "catalog_id": data.get("catalog_id"),
    #             "sites": sites_json,
    #         }

    #         # Send the batch of created sites
    #         await self.send_action(self.SEND_IMPORT_SITES, created_sites_info)
    #         logger.info(f"Sent batch of {len(sites_json)} sites.")

    #     # Optionally, send a completion message
    #     logger.info("Completed processing all site batches.")


    # async def process_site(
    #     self,
    #     site_dict: Dict[str, Any],
    #     view_id: str,
    #     session,
    #     variables: list
    # ) -> Dict[str, Any]:
    #     """
    #     Processes a single site:
    #     - Validates and creates a Pydantic schema.
    #     - Creates the site in the database.
    #     - Builds the JSON payload for the response.
    #     """
    #     try:
    #         # Validate and create Pydantic schema
    #         schema = CUAHSISiteCreate(
    #             title=site_dict.get("sitename", "Unknown Site"),
    #             code=site_dict.get("sitecode", ""),
    #             description="",  # Adjust as needed
    #             latitude=site_dict.get("latitude"),
    #             longitude=site_dict.get("longitude"),
    #             elevation=site_dict.get("elevation", 0.0),
    #             countries=site_dict.get("country", "No Data was Provided"),
    #         )
    #     except ValidationError as ve:
    #         logger.error(f"Pydantic validation error for site {site_dict.get('sitename', 'Unknown')}: {ve}")
    #         raise ve  # Re-raise exception to be handled in the calling function
    #     except KeyError as ke:
    #         logger.error(f"Missing key in site data {site_dict}: {ke}")
    #         raise ke

    #     # Create site in DB
    #     try:
    #         new_site = await create_site(session, view_id, schema)
    #     except Exception as e:
    #         logger.error(f"Error creating site {schema.title}: {e}")
    #         raise e

    #     # Build the JSON for your message
    #     site_json = {
    #         "id": str(new_site.id),
    #         "name": new_site.title,
    #         "latitude": new_site.latitude,
    #         "longitude": new_site.longitude,
    #         "countries": new_site.countries,
    #         "elevation": new_site.elevation,
    #         "variables": variables,
    #     }

    #     return site_json

    # @RBH.action_handler
    # async def get_site(self, event, action, data, session):
    #     site = await self.get_site(data,session)
    #     pydantic_site = CUAHSISiteRead.model_validate(site)
    #     site_json = pydantic_site.model_dump()
    #     await self.send_action(self.SEND_GET_SITE, site_json)

