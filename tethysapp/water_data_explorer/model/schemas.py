# schemas.py
from pydantic import BaseModel, UUID4, ValidationError
from typing import Optional, List

# ------------------ HISCatalog ------------------ #
class HISCatalogBase(BaseModel):
    name: str
    endpoint: str
    tags: List[str] = []

class HISCatalogCreate(HISCatalogBase):
    """Schema for creating HISCatalog"""
    pass

class HISCatalogRead(HISCatalogBase):
    """Schema for reading HISCatalog from the DB"""
    id: UUID4

    class Config:
        from_attributes = True


# ------------------ CUAHSIService ------------------ #
class CUAHSIServiceBase(BaseModel):
    title: str
    url: str
    description: str
    variablecount: int
    valuecount: Optional[int] = 0
    sitecount: int
    countries: Optional[str] = None

class CUAHSIServiceCreate(CUAHSIServiceBase):
    """Schema for creating a CUAHSIService"""
    pass

class CUAHSIServiceRead(CUAHSIServiceBase):
    """Schema for reading CUAHSIService from the DB"""
    id: UUID4

    class Config:
        orm_mode = True

# And so on for CUAHSISite, CUAHSIVariable if needed...
