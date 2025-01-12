# tethysapp/water_data_explorer/schemas/__site_schema.py

from __future__ import annotations

from typing import TYPE_CHECKING, List, Optional
from pydantic import BaseModel, UUID4,Field

if TYPE_CHECKING:
    from .__datastream_schema import CUAHSIDataStreamRead, HydroServer2DatastreamRead

class SiteReadBase(BaseModel):
    id: UUID4
    type: str
    name: Optional[str] = None
    description: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    tags: List[str] = []
    country: Optional[str] = None
    elevation: Optional[float] = None

    class Config:
        from_attributes = True

class CUAHSISiteRead(SiteReadBase):
    type: str = "cuahsi"
    code: Optional[str] = None
    service_url: Optional[str] = None
    # datastreams: List[CUAHSIDataStreamRead] = Field(default_factory=list)
    
    
    class Config:
        pass


class HydroServer2SiteRead(SiteReadBase):
    type: str = "hydroserver2"
    thing_id: Optional[UUID4] = None
    sampling_feature_type: Optional[str] = None
    sampling_feature_code: Optional[str] = None
    site_type: Optional[str] = None       # keep only one site_type
    is_private: Optional[bool] = False
    data_disclaimer: Optional[str] = None
    elevation_datum: Optional[str] = None
    state: Optional[str] = None
    county: Optional[str] = None
    hydroserver_url: Optional[str] = None

    datastreams: List["HydroServer2DatastreamRead"] = []

#
# Create schemas
#
class SiteCreateBase(BaseModel):
    type: str
    name: Optional[str] = None
    description: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    tags: List[str] = []
    country: Optional[str] = None
    elevation: Optional[float] = None

    class Config:
        from_attributes = True

class CUAHSISiteCreate(SiteCreateBase):
    type: str = "cuahsi"
    code: str
    service_url: Optional[str] = None

class HydroServer2SiteCreate(SiteCreateBase):
    type: str = "hydroserver2"
    thing_id: Optional[UUID4] = None
    sampling_feature_type: Optional[str] = None
    sampling_feature_code: Optional[str] = None
    site_type: Optional[str] = None  # keep only one
    is_private: Optional[bool] = False
    data_disclaimer: Optional[str] = None
    elevation_datum: Optional[str] = None
    state: Optional[str] = None
    county: Optional[str] = None
    hydroserver_url: Optional[str] = None

SiteRead = CUAHSISiteRead | HydroServer2SiteRead
SiteCreate = CUAHSISiteCreate | HydroServer2SiteCreate
