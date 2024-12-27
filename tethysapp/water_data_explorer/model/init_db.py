from sqlalchemy.orm import sessionmaker
from . import cuahsi
from . import hydroserver2


def create_tables(engine, first_time):
    print("Initializing Persistant Storage")
    cuahsi.CuahsiBase.metadata.create_all(engine)
    hydroserver2.HydroServer2Base.metadata.create_all(engine)
    if first_time:
        SessionMaker = sessionmaker(bind=engine)
        session = SessionMaker()
        session.close()
        print("Finishing Initializing Persistant Storage")