# schemas.py
from pydantic import BaseModel, UUID4, ValidationError
from typing import Optional, List

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
        from_attributes = True


# ------------------ HISCatalog ------------------ #
class HISCatalogBase(BaseModel):
    name: str
    endpoint: str
    servicescount: Optional[int] = 0
    tags: List[str] = []

class HISCatalogCreate(HISCatalogBase):
    """Schema for creating HISCatalog"""
    pass

class HISCatalogRead(HISCatalogBase):
    """Schema for reading HISCatalog from the DB"""
    id: UUID4
    views: List[CUAHSIServiceRead] = []  # Renamed from 'services' to 'views' for clarity

    class Config:
        from_attributes = True


# ------------------ CUAHSISite ------------------ #
class CUAHSISiteBase(BaseModel):
    title: str
    code: str
    description: Optional[str] = None
    latitude: float
    longitude: float
    elevation: Optional[float] = None
    countries: Optional[str] = None

class CUAHSISiteCreate(CUAHSISiteBase):
    """Schema for creating a CUAHSISite"""
    pass

class CUAHSISiteRead(CUAHSISiteBase):
    """Schema for reading CUAHSISite from the DB"""
    id: UUID4

    class Config:
        from_attributes = True


# ------------------ CUAHSIVariable ------------------ #
class CUAHSIVariableBase(BaseModel):
    name: str
    code: str
    units: str
    datatype: str
    valuetype: str
    samplemedium: str
    timesupport: Optional[float] = None
    timesupportunits: Optional[str] = None
    comments: Optional[str] = None

class CUAHSIVariableCreate(CUAHSIVariableBase):
    """Schema for creating a CUAHSIVariable"""
    pass

class CUAHSIVariableRead(CUAHSIVariableBase):
    """Schema for reading CUAHSIVariable from the DB"""
    id: UUID4

    class Config:
        from_attributes = True