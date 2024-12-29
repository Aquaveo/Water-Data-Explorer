# crud.py
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from .cuahsi import HISCatalog, CUAHSIService
from .schemas import HISCatalogCreate, HISCatalogRead,CUAHSIServiceCreate

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
    """Create a new view for a given HISCatalog."""
    catalog = await get_his_catalog_by_id(db, catalog_id)
    if catalog:
        # Assuming there is a method to create a view in the HISCatalog model
        
        cuahsi_service = CUAHSIService(
            title=view_in.title,
            url=view_in.url,
            description=view_in.description,
            variablecount=view_in.variablecount,
            valuecount=view_in.valuecount,
            sitecount=view_in.sitecount,
            countries=view_in.countries,
            catalog_id=catalog.id
        )
        catalog.services.append(cuahsi_service)
        db.add(cuahsi_service)
        await db.commit()
        await db.refresh(catalog)
        return cuahsi_service

    else:
        raise ValueError(f"HISCatalog with id {catalog_id} not found")


async def get_his_catalog_by_id(
    db: AsyncSession,
    catalog_id: str
) -> Optional[HISCatalog]:
    """Get an HISCatalog by ID"""
    return await db.get(HISCatalog, catalog_id)
