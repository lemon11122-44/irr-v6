from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from d6 import ENG, B
from m6 import N6A, N6P, N6C
from a6 import h
from r6 import api, web
import os

app = FastAPI(title="IRR n6", version="6.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

app.include_router(api.rt)
app.include_router(web.rt)

ud = os.path.join(os.path.dirname(__file__), "up6")
os.makedirs(ud, exist_ok=True)
app.mount("/st", StaticFiles(directory=ud), name="st")

@app.get("/")
def root():
    return {"app": "IRR n6", "ver": "6.0"}

@app.on_event("startup")
def seed():
    B.metadata.create_all(bind=ENG)
    from d6 import S
    ss = S()
    if not ss.query(N6A).first():
        ss.add(N6A(un="root", pw=h("root888"), nk="超级管理员"))
        ss.add(N6P(nm="借呗", tp="互联网信贷", ds="支付宝旗下贷款产品"))
        ss.add(N6P(nm="京东金条", tp="互联网信贷", ds="京东金融信用贷款"))
        ss.add(N6C(ky="bn_t", vl="IRR真实年化怎么算？"))
        ss.add(N6C(ky="bn_s", vl="网贷隐藏费用计入真实成本"))
        ss.commit()
    ss.close()
