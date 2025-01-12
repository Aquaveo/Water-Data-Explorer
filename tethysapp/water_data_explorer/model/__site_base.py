from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import (
    Column, String, Text, Boolean, DateTime, ForeignKey, Integer,
    Float, ARRAY
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid

from .__base import Base

class SiteBase(Base):
    """
    Polymorphic base for all Sites.
    Stored in 'site_base' table, with a 'type' column to distinguish 
    between 'hydroserver2' vs. 'cuahsi' children.
    """
    __tablename__ = "site_base"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    type = Column(String(50), nullable=False)  # e.g. "hydroserver2" or "cuahsi"
    
    # Common columns to both site types:
    name = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    tags = Column(ARRAY(String), default=[])
    country = Column(String(255), nullable=True)
    elevation = Column(Float, nullable=True, name="elevation")

    # Polymorphic arguments:
    __mapper_args__ = {
        "polymorphic_on": type,
        "polymorphic_identity": "site_base",
    }

    # Relationship to DataStreamBase (below) if you want to unify datastreams:
    datastreams = relationship(
        "DataStreamBase",
        back_populates="site",
        cascade="all, delete-orphan"
    )


class HydroServer2Site(SiteBase):
    """
    Specialized site info for "HydroServer2" type.
    Stored in 'hydroserver2_site' table but reuses the 'id' from 'site_base'.
    """
    __tablename__ = "hydroserver2_site"

    # Reuse the same primary key from SiteBase
    id = Column(UUID(as_uuid=True), ForeignKey("site_base.id"), primary_key=True)
    thing_id =Column(UUID(as_uuid=True), name="thingId")
    sampling_feature_type = Column(String(200), name="samplingFeatureType")
    sampling_feature_code = Column(String(200), name="samplingFeatureCode")
    site_type = Column(String(200), name="siteType")
    is_private = Column(Boolean, default=False, name="isPrivate")
    data_disclaimer = Column(Text, nullable=True, name="dataDisclaimer")
    elevation_datum = Column(String(255), nullable=True, name="elevationDatum")
    state = Column(String(200), nullable=True)
    county = Column(String(200), nullable=True)

    # If this "Thing" belongs to a particular hydroserver2 instance
    # (optional) you can store references here:
    hydroserver_url = Column(String(255), name="hydroserverUrl")

    __mapper_args__ = {
        "polymorphic_identity": "hydroserver2",
    }


class CUAHSISite(SiteBase):
    """
    Specialized site info for CUAHSI type.
    Stored in 'cuahsi_site' table but reuses the 'id' from 'site_base'.
    """
    __tablename__ = "cuahsi_site"

    # Reuse the same primary key from SiteBase
    id = Column(UUID(as_uuid=True), ForeignKey("site_base.id"), primary_key=True)

    # Extra columns unique to CUAHSI:
    code = Column(String(1000))
    service_url =  Column(String(255), name="serviceUrl")

    __mapper_args__ = {
        "polymorphic_identity": "cuahsi",
    }
