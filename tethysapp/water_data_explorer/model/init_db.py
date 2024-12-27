from sqlalchemy.orm import sessionmaker

from .cuahsi import create_cuahsi_tables
from .hydroserver2 import create_hydroserver2_tables

# Initialize an empty database, if the database has not been created already.


def create_tables(engine, first_time):
    print("Initializing Persistant Storage")
    create_cuahsi_tables(engine)
    create_hydroserver2_tables(engine)
    if first_time:
        # # Make session
        SessionMaker = sessionmaker(bind=engine)
        session = SessionMaker()

        session.close()
        print("Finishing Initializing Persistant Storage")