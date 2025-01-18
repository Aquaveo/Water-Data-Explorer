from __future__ import annotations

import logging
from typing import Dict, Any, List

from pydantic import ValidationError
from sqlalchemy.ext.asyncio import AsyncSession
from ..backend_actions import BackendActions
from .resource_backend_handler import ResourceBackendHandler as RBH
from .cuahsi_backend_handler import CuahsiBackendHandler

logger = logging.getLogger(__name__)


class SitesBackendHandler(RBH):
    SEND_DATA_ACTION: BackendActions = BackendActions.GET_SITES
    SEND_GET_SITE: BackendActions = BackendActions.GET_SITE

    @property
    def receiving_actions(self) -> dict[BackendActions, callable]:
        return {
            BackendActions.GET_SITE: self.get_site,
            BackendActions.GET_SITES: self.handle_get_sites,
            BackendActions.GET_SITE_INFO: self.get_site_info_handler
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


    async def get_site_info_handler(self, event, action, data):
        """
        Handler to fetch site info via SOAP and send it to the frontend.
        """
        site_type = data.get("type")
        cuahsi_handler = CuahsiBackendHandler(self.backend_consumer)

        if site_type == "cuahsi":
           await cuahsi_handler.get_cuahsi_site_info(data)
        else:
            pass