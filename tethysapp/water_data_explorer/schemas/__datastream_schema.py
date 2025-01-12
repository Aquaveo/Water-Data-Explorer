# tethysapp/water_data_explorer/schemas/__datastream_schema.py

from __future__ import annotations

from typing import TYPE_CHECKING, List, Optional
from pydantic import BaseModel, UUID4
from datetime import datetime  # <-- for phenomenon_begin_time, etc.

if TYPE_CHECKING:
    # If datastream references site schemas at type-check time
    # from .__site_schema import CUAHSISiteRead, HydroServer2SiteRead
    pass

class DataStreamReadBase(BaseModel):
    id: UUID4
    type: str
    name: Optional[str] = None
    no_data_value: Optional[float] = None
    tags: List[str] = []

    class Config:
        from_attributes = True

class CUAHSIDataStreamRead(DataStreamReadBase):
    type: str = "cuahsi_datastream"
    code: Optional[str] = None
    value_type: Optional[str] = None
    general_category: Optional[str] = None
    data_type: Optional[str] = None
    sample_medium: Optional[str] = None
    unit_name: Optional[str] = None
    unit_type: Optional[str] = None
    unit_abbreviation: Optional[str] = None
    is_regular: Optional[bool] = None
    time_unit_name: Optional[str] = None
    time_unit_abbreviation: Optional[str] = None
    time_support: Optional[float] = None
    speciation: Optional[str] = None

class HydroServer2DatastreamRead(DataStreamReadBase):
    type: str = "hydroserver2_datastream"
    sensor_id: Optional[str] = None
    description: Optional[str] = None
    observation_property_id: Optional[str] = None
    unit_id: Optional[str] = None
    unit_name: Optional[str] = None
    processing_level_id: Optional[str] = None
    processing_level_code: Optional[str] = None
    observation_type: Optional[str] = None
    result_type: Optional[str] = None
    status: Optional[str] = None
    sampled_medium: Optional[str] = None
    value_count: Optional[int] = None
    intended_time_spacing: Optional[float] = None
    intended_time_spacing_units: Optional[str] = None
    aggregation_statistic: Optional[str] = None
    time_aggregation_interval: Optional[float] = None
    time_aggregation_interval_units: Optional[str] = None
    phenomenon_begin_time: Optional[datetime] = None
    phenomenon_end_time: Optional[datetime] = None
    is_visible: Optional[bool] = True
    is_data_visible: Optional[bool] = True
    data_source_column: Optional[str] = None
    archived: Optional[bool] = False
    observed_area: Optional[str] = None
    result_end_time: Optional[datetime] = None
    result_begin_time: Optional[datetime] = None

#
# Create schemas
#
class DataStreamCreateBase(BaseModel):
    type: str
    name: Optional[str] = None
    no_data_value: Optional[float] = None
    tags: List[str] = []

    class Config:
        from_attributes = True

class CUAHSIDataStreamCreate(DataStreamCreateBase):
    type: str = "cuahsi_datastream"
    code: Optional[str] = None
    value_type: Optional[str] = None
    general_category: Optional[str] = None
    data_type: Optional[str] = None
    sample_medium: Optional[str] = None
    unit_name: Optional[str] = None
    unit_type: Optional[str] = None
    unit_abbreviation: Optional[str] = None
    is_regular: Optional[bool] = None
    time_unit_name: Optional[str] = None
    time_unit_abbreviation: Optional[str] = None
    time_support: Optional[float] = None
    speciation: Optional[str] = None

class HydroServer2DatastreamCreate(DataStreamCreateBase):
    type: str = "hydroserver2_datastream"
    sensor_id: Optional[str] = None
    description: Optional[str] = None
    observation_property_id: Optional[str] = None
    unit_id: Optional[str] = None
    unit_name: Optional[str] = None
    processing_level_id: Optional[str] = None
    processing_level_code: Optional[str] = None
    observation_type: Optional[str] = None
    result_type: Optional[str] = None
    status: Optional[str] = None
    sampled_medium: Optional[str] = None
    value_count: Optional[int] = None
    intended_time_spacing: Optional[float] = None
    intended_time_spacing_units: Optional[str] = None
    aggregation_statistic: Optional[str] = None
    time_aggregation_interval: Optional[float] = None
    time_aggregation_interval_units: Optional[str] = None
    phenomenon_begin_time: Optional[datetime] = None
    phenomenon_end_time: Optional[datetime] = None
    is_visible: Optional[bool] = True
    is_data_visible: Optional[bool] = True
    data_source_column: Optional[str] = None
    archived: Optional[bool] = False
    observed_area: Optional[str] = None
    result_end_time: Optional[datetime] = None
    result_begin_time: Optional[datetime] = None

DataStreamRead = CUAHSIDataStreamRead | HydroServer2DatastreamRead
DataStreamCreate = CUAHSIDataStreamCreate | HydroServer2DatastreamCreate
