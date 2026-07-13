from datetime import datetime, timedelta
from jose import jwt
from passlib.context import CryptContext

SK = "n6-secret-9876543210"
AL = "HS256"
P = CryptContext(schemes=["bcrypt"], deprecated="auto")

def h(s): return P.hash(s)
def c(s, h): return P.verify(s, h)
def mk(u): return jwt.encode({"u": str(u), "r": "n6", "e": (datetime.utcnow()+timedelta(days=7)).timestamp()}, SK, algorithm=AL)
def rd(t):
    try: return jwt.decode(t, SK, algorithms=[AL])
    except: return {}
