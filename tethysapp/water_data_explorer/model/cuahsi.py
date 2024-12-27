from sqlalchemy.dialects.postgresql import UUID, DOUBLE_PRECISION
from sqlalchemy import Column, Integer, String, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
import uuid

CuahsiBase = declarative_base()

class HISCatalog(CuahsiBase):
    __tablename__ = 'his_catalog'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(1000))
    tags = Column(String(1000))

    # Use the class name "CUAHSIService" in the relationship, 
    # and the table name is 'cuahsi_service' for the ForeignKey.
    services = relationship(
        "CUAHSIService",
        back_populates="catalog",
        cascade="all, delete, delete-orphan"
    )

    def __init__(self, name, tags):
        self.name = name
        self.tags = tags


class CUAHSIService(CuahsiBase):
    __tablename__ = "cuahsi_service"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(1000))
    url = Column(String(2083))
    description = Column(Text)
    variablecount = Column(Integer)
    valuecount = Column(Integer)
    sitecount = Column(Integer)
    countries = Column(String(2083))

    # Match the 'his_catalog' table name and UUID type for the ForeignKey
    catalog_id = Column(UUID(as_uuid=True), ForeignKey('his_catalog.id'))
    # The relationship references the Python class "HISCatalog"
    catalog = relationship("HISCatalog", back_populates="services")

    # This references the CUAHSISite model by class name
    sites = relationship(
        "CUAHSISite",
        back_populates="service",
        cascade="all, delete, delete-orphan"
    )

    # This references the CUAHSIVariable model by class name
    variables = relationship(
        "CUAHSIVariable",
        back_populates="service",
        cascade="all, delete, delete-orphan"
    )

    def __init__(self, title, url, description, variables, variablecount, sitecount, countries):
        self.title = title
        self.url = url
        self.description = description
        self.variables = variables
        self.variablecount = variablecount
        self.sitecount = sitecount
        self.countries = countries


class CUAHSISite(CuahsiBase):
    __tablename__ = 'cuahsi_site'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(1000))
    code = Column(String(1000))
    description = Column(Text)
    latitude = Column(DOUBLE_PRECISION)
    longitude = Column(DOUBLE_PRECISION)
    elevation = Column(DOUBLE_PRECISION)
    countries = Column(Text)

    # Match the 'cuahsi_service' table name and UUID type for ForeignKey
    service_id = Column(UUID(as_uuid=True), ForeignKey('cuahsi_service.id'))
    service = relationship("CUAHSIService", back_populates="sites")

    # Link back to CUAHSIVariable
    variables = relationship(
        "CUAHSIVariable",
        back_populates="site",
        cascade="all, delete, delete-orphan"
    )

    def __init__(self, title, code, description, latitude, longitude, elevation, countries):
        self.title = title
        self.code = code
        self.description = description
        self.latitude = latitude
        self.longitude = longitude
        self.elevation = elevation
        self.countries = countries


class CUAHSIVariable(CuahsiBase):
    __tablename__ = 'cuahsi_variable'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(1000))
    code = Column(String(1000))
    value_type = Column(String(1000))
    general_category = Column(String(1000))
    data_type = Column(String(1000))
    sample_medium = Column(String(1000))
    unit_name = Column(String(1000))
    unit_type = Column(String(1000))
    unit_abbreviation = Column(String(1000))
    no_data_value = Column(DOUBLE_PRECISION)
    is_regular = Column(Boolean)
    time_unit_name = Column(String(1000))
    time_unit_abbreviation = Column(String(1000))
    time_support = Column(DOUBLE_PRECISION)
    speciation = Column(String(1000))

    # Match the 'cuahsi_site' table name and UUID type for ForeignKey
    site_id = Column(UUID(as_uuid=True), ForeignKey('cuahsi_site.id'))
    site = relationship("CUAHSISite", back_populates="variables")

    # Match the 'cuahsi_service' table name and UUID type for ForeignKey
    service_id = Column(UUID(as_uuid=True), ForeignKey('cuahsi_service.id'))
    service = relationship("CUAHSIService", back_populates="variables")

    def __init__(self, name, code, value_type, general_category, data_type, sample_medium,
                 unit_name, unit_type, unit_abbreviation, no_data_value, is_regular,
                 time_unit_name, time_unit_abbreviation, time_support, speciation):
        self.name = name
        self.code = code
        self.value_type = value_type
        self.general_category = general_category
        self.data_type = data_type
        self.sample_medium = sample_medium
        self.unit_name = unit_name
        self.unit_type = unit_type
        self.unit_abbreviation = unit_abbreviation
        self.no_data_value = no_data_value
        self.is_regular = is_regular
        self.time_unit_name = time_unit_name
        self.time_unit_abbreviation = time_unit_abbreviation
        self.time_support = time_support
        self.speciation = speciation
