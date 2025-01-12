from __future__ import annotations

import logging
from typing import (
    AsyncGenerator,
    List,
    Optional,
    Union,
    Dict,
    Any
)

from pydantic import ValidationError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import select

from ..backend_actions import BackendActions
from tethysapp.water_data_explorer.model import (
    CUAHSISite
    )

from tethysapp.water_data_explorer.schemas import (
    CUAHSISiteRead,
)


log = logging.getLogger(__name__)

class ResourceBackendHandler:
    SEND_DATA_ACTION: Optional[BackendActions] = None
    PROP_DNE = '###prop-doesnt-exist###'  # For getattr checks where None value is valid

    def __init__(self, backend_consumer: Any) -> None:
        self.backend_consumer = backend_consumer
        self.sessionmaker = backend_consumer.sessionmaker

    @property
    def receiving_actions(self) -> dict[BackendActions, callable]:
        raise NotImplementedError("The receiving_actions property must be implemented by the subclass.")

    @staticmethod
    def action_handler(method):
        """Decorator to automatically handle async SQLAlchemy session and errors."""
        async def _action_handler(
            self: ResourceBackendHandler,
            event: dict[str, Any],
            action: dict[str, Any],
            data: dict[str, Any]
        ) -> None:
            async with self.sessionmaker() as session:
                try:
                    await method(self, event, action, data, session)
                except ValidationError as e:
                    msg = (
                        f'Validation error occurred while handling {action.get("type")} '
                        f'action "{action.get("id")}": {e}'
                    )
                    await self.send_error(msg, action, data, {'errors': e.errors()})
                    log.debug(msg)
                except ValueError as e:
                    msg = str(e)
                    await self.send_error(msg, action, data, {})
                    log.debug(msg)
                except Exception as e:
                    msg = (
                        f'An unexpected error occurred while handling action "{action}": {str(e)}'
                    )
                    await self.send_error(msg, action, data, {})
                    log.exception(msg)
        return _action_handler

    async def get_site(
        self,
        event: dict[str, Any],
        action: dict[str, Any],
        data: dict[str, Any],
        session: AsyncSession
    ) -> CUAHSISite:
        """
        Retrieve a CUAHSISite by ID.
        """
        site_id = data.get('id')
        if not site_id:
            raise ValueError("No 'id' provided to get_site")

        def _query(s, site_id):
            return s.query(CUAHSISite).get(site_id)

        site: Optional[CUAHSISite] = await session.run_sync(_query, site_id=site_id)
        if not site:
            raise ValueError(f'Could not find Site with ID "{site_id}"')
        return site

    async def get_sites(self, session: AsyncSession) -> List[CUAHSISite]:
        """
        Get all CUAHSISite records with their relationships loaded.
        Adjust the loading strategy (e.g. variables, service) as needed.
        """
        stmt = (
            select(CUAHSISite)
            .options(
                selectinload(CUAHSISite.datastreams)
            )
        )
        result = await session.execute(stmt)
        sites: List[CUAHSISite] = result.scalars().all()
        return sites

    async def get_sites_generator(self, session: AsyncSession) -> AsyncGenerator[Dict[str, Any], None]:
        """
        Async generator that yields each Site as a Pydantic dict.
        """
        sites = await self.get_sites(session)
        for site in sites:
            site_read = CUAHSISiteRead.model_validate(site)
            # If you have additional relations, convert them here
            # e.g. site_read.datastreams = [...]
            yield site_read.model_dump()

    async def send_data(
        self,
        session: AsyncSession,
        resource: Union[CUAHSISite, List[CUAHSISite]],
        from_action: str
    ) -> None:
        """
        Convert one or many CUAHSISite objects to a Pydantic model and send them.
        """
        if not self.SEND_DATA_ACTION:
            log.error(f'No SEND_DATA_ACTION defined for "{self.__class__.__name__}".')
            raise NotImplementedError("SEND_DATA_ACTION must be defined in the subclass.")

        if isinstance(resource, list):
            data_out: List[dict[str, Any]] = []
            for r in resource:
                site_read = CUAHSISiteRead.model_validate(r)
                data_out.append(site_read.model_dump())
        else:
            site_read = CUAHSISiteRead.model_validate(resource)
            data_out = site_read.model_dump()

        payload: dict[str, Any] = {
            "fromAction": from_action,
            "data": data_out
        }
        await self.send_action(self.SEND_DATA_ACTION, payload)

    async def send_action(self, action: BackendActions, payload: dict[str, Any]) -> None:
        """Send an action + payload to the frontend via the consumer."""
        await self.backend_consumer.send_action(action, payload)

    async def send_acknowledge(
        self,
        msg: str,
        action: BackendActions,
        payload: dict[str, Any],
        details: Optional[dict[str, Any]] = None
    ) -> None:
        """Sends an acknowledgement."""
        await self.backend_consumer.send_acknowledge(msg, action, payload, details)

    async def send_error(
        self,
        msg: str,
        action: dict[str, Any],
        payload: dict[str, Any],
        details: Optional[dict[str, Any]] = None
    ) -> None:
        """Sends an error message."""
        await self.backend_consumer.send_error(msg, action, payload, details)

    async def set_status(
        self,
        session: AsyncSession,
        resource: Any,
        status: str
    ) -> None:
        """
        Example: Set status on a Tethys `Resource` object if you have that pattern.
        Otherwise, adapt to your actual data model.
        """
        def _set_status(s, resource, status):
            resource.set_status(status=status)  # If your model has .set_status
            s.commit()

        await session.run_sync(_set_status, resource=resource, status=status)


