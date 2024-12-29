# crud.py
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from .cuahsi import HISCatalog
from .schemas import HISCatalogCreate, HISCatalogRead

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

async def get_his_catalog_by_id(
    db: AsyncSession,
    catalog_id: str
) -> Optional[HISCatalog]:
    """Get an HISCatalog by ID"""
    return await db.get(HISCatalog, catalog_id)
