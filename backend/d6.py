from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

ENG = create_engine("sqlite:///./n6.db", connect_args={"check_same_thread": False})
S = sessionmaker(autocommit=False, autoflush=False, bind=ENG)
B = declarative_base()

def gb():
    ss = S()
    try: yield ss
    finally: ss.close()
