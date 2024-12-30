from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from .cuahsi import HISCatalog, CUAHSIService
from .schemas import HISCatalogCreate, CUAHSIServiceCreate

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
    # 1) Fetch the catalog (already using selectinload, if you like)
    catalog = await get_his_catalog_by_id(db, catalog_id)
    if catalog is None:
        raise ValueError(f"HISCatalog with id {catalog_id} not found")

    # 2) Create a new CUAHSIService object
    cuahsi_service = CUAHSIService(
        title=view_in.title,
        url=view_in.url,
        description=view_in.description,
        variablecount=view_in.variablecount,
        valuecount=view_in.valuecount,
        sitecount=view_in.sitecount,
        countries=view_in.countries
    )

    # 3) Append the new service to the catalog
    catalog.services.append(cuahsi_service)

    # 4) Persist changes
    db.add(cuahsi_service)
    await db.commit()

    # 5) Manually reload the catalog from the database with selectinload
    await db.execute(
        select(HISCatalog)
        .options(selectinload(HISCatalog.services))
        .where(HISCatalog.id == catalog_id)
    )
    
    return cuahsi_service