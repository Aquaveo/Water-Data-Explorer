from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, AsyncGenerator

from typing import Optional, List
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from .cuahsi import HISCatalog, CUAHSIService, CUAHSISite
from .schemas import HISCatalogCreate, CUAHSIServiceCreate, CUAHSISiteCreate
import logging

logger = logging.getLogger(__name__)


async def get_his_catalog_by_id(
    db: AsyncSession,
    catalog_id: str
) -> Optional[HISCatalog]:
    """
    Get an HISCatalog by ID, with its services relationship pre-loaded
    to avoid async lazy-loading issues.
    """
    result = await db.execute(
        select(HISCatalog)
        .options(selectinload(HISCatalog.services))
        .where(HISCatalog.id == catalog_id)
    )
    return result.scalar_one_or_none()

async def get_his_view_by_id(
    db: AsyncSession,
    view_id: str
) -> Optional[CUAHSIService]:
    """
    Get an CUAHSIService by ID, with its sites relationship pre-loaded
    to avoid async lazy-loading issues.
    """
    result = await db.execute(
        select(CUAHSIService)
        .options(selectinload(CUAHSIService.sites))
        .where(CUAHSIService.id == view_id)
    )
    return result.scalar_one_or_none()

async def create_his_catalog(
    db: AsyncSession,
    catalog_in: HISCatalogCreate
) -> HISCatalog:
    """Create a new HISCatalog in the DB from a Pydantic schema."""
    new_catalog = HISCatalog(
        name=catalog_in.name,
        endpoint=catalog_in.endpoint,
        tags=catalog_in.tags
    )
    db.add(new_catalog)
    await db.commit()
    await db.refresh(new_catalog)
    return new_catalog

async def create_view(
    db: AsyncSession,
    catalog_id: str,
    view_in: CUAHSIServiceCreate
) -> CUAHSIService:
    """Create a new view (CUAHSIService) for a given HISCatalog."""
    catalog = await get_his_catalog_by_id(db, catalog_id)
    if catalog is None:
        raise ValueError(f"HISCatalog with id {catalog_id} not found")

    cuahsi_service = CUAHSIService(
        title=view_in.title,
        url=view_in.url,
        description=view_in.description,
        variablecount=view_in.variablecount,
        valuecount=view_in.valuecount,
        sitecount=view_in.sitecount,
        countries=view_in.countries
    )

    catalog.services.append(cuahsi_service)
    db.add(cuahsi_service)
    await db.commit()
    await db.refresh(cuahsi_service)
    return cuahsi_service


async def create_site(
    db: AsyncSession,
    view_id: str,
    site_in: CUAHSISiteCreate     
) -> CUAHSISite:
    """Create a new site for a given CUAHSIService."""
    service = await get_his_view_by_id(db, view_id)
    if service is None:
        raise ValueError(f"HISCatalog with id {view_id} not found")
    
    site = CUAHSISite(
        title=site_in.title,
        code=site_in.code,
        description=site_in.description,
        latitude=site_in.latitude,
        longitude=site_in.longitude,
        elevation=site_in.elevation,
        countries=site_in.countries
    )

    service.sites.append(site)
    db.add(site)
    await db.commit()
    await db.refresh(site)
    return site


async def create_sites_bulk(
    db: AsyncSession,
    view_id: str,
    sites_in: List[CUAHSISiteCreate]
) -> List[CUAHSISite]:
    """
    Create multiple CUAHSISite records in bulk for a given CUAHSIService.

    Args:
        db (AsyncSession): The database session.
        view_id (str): The ID of the CUAHSIService to associate the sites with.
        sites_in (List[CUAHSISiteCreate]): A list of site creation schemas.

    Returns:
        List[CUAHSISite]: A list of created CUAHSISite ORM objects.
    """
    # Fetch the CUAHSIService by view_id
    service = await get_his_view_by_id(db, view_id)
    if service is None:
        raise ValueError(f"CUAHSIService with id {view_id} not found")

    # Convert Pydantic schemas to ORM objects
    sites = [
        CUAHSISite(
            title=site.title,
            code=site.code,
            description=site.description,
            latitude=site.latitude,
            longitude=site.longitude,
            elevation=site.elevation,
            countries=site.countries
        )
        for site in sites_in
    ]

    # Associate sites with the service
    service.sites.extend(sites)

    # Add all sites to the session
    db.add_all(sites)

    # Commit the transaction
    try:
        await db.commit()
        # Refresh the ORM objects to get populated fields (like ID)
        for site in sites:
            await db.refresh(site)
        logger.info(f"Successfully inserted {len(sites)} sites in bulk.")
    except Exception as e:
        await db.rollback()
        logger.error(f"Bulk insert failed: {e}")
        raise e

    return sites