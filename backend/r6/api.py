from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from d6 import gb
from m6 import N6P, N6K, N6S, N6C
import os, uuid, json

MINI_DATA = os.path.join(os.path.dirname(__file__), "..", "..", "mini", "data")

rt = APIRouter(prefix="/n6", tags=["n6"])
HOST = "http://127.0.0.1"
D = os.path.join(os.path.dirname(__file__), "..", "up6")
os.makedirs(D, exist_ok=True)

@rt.post("/up")
async def up(f: UploadFile = File(...)):
    e = f.filename.split(".")[-1] if "." in f.filename else "png"
    n = f"{uuid.uuid4().hex}.{e}"
    with open(os.path.join(D, n), "wb") as w: w.write(await f.read())
    return {"u": f"/st/{n}", "url": f"{HOST}/st/{n}"}

@rt.get("/st/{fn}")
def su(fn: str):
    p = os.path.join(D, fn)
    if not os.path.exists(p): raise HTTPException(404)
    return FileResponse(p)

# platform
@rt.get("/ps")
def lps(db: Session = Depends(gb)):
    q = db.query(N6P).order_by(N6P.sq, N6P.id).all()
    return [{"id": p.id, "nm": p.nm, "tp": p.tp, "ic": p.ic or "", "ds": p.ds or ""} for p in q]

@rt.post("/ps")
def aps(d: dict, db: Session = Depends(gb)):
    p = N6P(nm=d.get("nm",""), tp=d.get("tp","其他"), ic=d.get("ic",""), ds=d.get("ds",""))
    db.add(p); db.commit(); db.refresh(p)
    return {"ok": True, "id": p.id}

@rt.put("/ps/{id}")
def eps(id: int, d: dict, db: Session = Depends(gb)):
    p = db.query(N6P).filter(N6P.id == id).first()
    if not p: raise HTTPException(404)
    for k in ["nm","tp","ic","ds","lk","sq","sh"]:
        if k in d: setattr(p, k, d[k])
    db.commit(); return {"ok": True}

@rt.delete("/ps/{id}")
def dps(id: int, db: Session = Depends(gb)):
    p = db.query(N6P).filter(N6P.id == id).first()
    if not p: raise HTTPException(404)
    db.delete(p); db.commit(); return {"ok": True}

# service
@rt.get("/sv")
def lsv(db: Session = Depends(gb)):
    q = db.query(N6S).order_by(N6S.id).all()
    return [{"id": s.id, "nn": s.nn, "ph": s.ph or "", "wx": s.wx or "", "av": s.av or "", "ol": s.ol} for s in q]

@rt.post("/sv")
def asv(d: dict, db: Session = Depends(gb)):
    s = N6S(nn=d.get("nn",""), ph=d.get("ph",""), wx=d.get("wx",""), av=d.get("av",""), ol=d.get("ol",True))
    db.add(s); db.commit(); db.refresh(s)
    return {"ok": True, "id": s.id}

@rt.put("/sv/{id}")
def esv(id: int, d: dict, db: Session = Depends(gb)):
    s = db.query(N6S).filter(N6S.id == id).first()
    if not s: raise HTTPException(404)
    for k in ["nn","ph","wx","av","ol","nt"]:
        if k in d: setattr(s, k, d[k])
    db.commit(); return {"ok": True}

@rt.delete("/sv/{id}")
def dsv(id: int, db: Session = Depends(gb)):
    s = db.query(N6S).filter(N6S.id == id).first()
    if not s: raise HTTPException(404)
    db.delete(s); db.commit(); return {"ok": True}

# know
@rt.get("/ks")
def lks(db: Session = Depends(gb)):
    q = db.query(N6K).order_by(N6K.id).all()
    return [{"id": a.id, "tl": a.tl, "sb": a.sb or "", "bt": a.bt, "bd": a.bd or "", "bg": a.bg, "on": a.on} for a in q]

@rt.post("/ks")
def aks(d: dict, db: Session = Depends(gb)):
    a = N6K(tl=d.get("tl",""), sb=d.get("sb",""), bt=d.get("bt","了解更多 →"), bd=d.get("bd",""), bg=d.get("bg","#FF44BB"))
    db.add(a); db.commit(); db.refresh(a)
    return {"ok": True, "id": a.id}

@rt.put("/ks/{id}")
def eks(id: int, d: dict, db: Session = Depends(gb)):
    a = db.query(N6K).filter(N6K.id == id).first()
    if not a: raise HTTPException(404)
    for k in ["tl","sb","bt","bg","ul","on"]:
        if k in d: setattr(a, k, d[k])
    db.commit(); return {"ok": True}

@rt.delete("/ks/{id}")
def dks(id: int, db: Session = Depends(gb)):
    a = db.query(N6K).filter(N6K.id == id).first()
    if not a: raise HTTPException(404)
    db.delete(a); db.commit(); return {"ok": True}

# config
@rt.get("/cg")
def lcg(db: Session = Depends(gb)):
    q = db.query(N6C).all()
    return {c.ky: c.vl for c in q}

@rt.post("/cg")
def scg(d: dict, db: Session = Depends(gb)):
    for k, v in d.items():
        c = db.query(N6C).filter(N6C.ky == k).first()
        if c: c.vl = str(v)
        else: db.add(N6C(ky=k, vl=str(v)))
    db.commit(); return {"ok": True}

# stats
@rt.get("/st")
def st(db: Session = Depends(gb)):
    return {"p": db.query(N6P).count(), "k": db.query(N6K).count(), "s": db.query(N6S).count(), "c": db.query(N6C).count()}

# 同步数据到小程序本地文件
@rt.get("/sync")
def sync(db: Session = Depends(gb)):
    # 平台数据
    plats = [{"id": p.id, "nm": p.nm, "tp": p.tp, "ic": p.ic or "", "ds": p.ds or ""} for p in db.query(N6P).all()]
    with open(os.path.join(MINI_DATA, "plat_data.js"), "w", encoding="utf-8") as f:
        f.write('/** 自动生成 */\n')
        f.write('module.exports = ' + json.dumps(plats, ensure_ascii=False, indent=2) + '\n')

    # 客服数据
    svcs = [{"id": s.id, "nn": s.nn, "ph": s.ph or "", "wx": s.wx or "", "av": s.av or "", "ol": s.ol} for s in db.query(N6S).all()]
    with open(os.path.join(MINI_DATA, "kf_data.js"), "w", encoding="utf-8") as f:
        f.write('/** 自动生成 - 修改后台客服数据后重新同步 */\n')
        f.write('module.exports = ' + json.dumps(svcs, ensure_ascii=False, indent=2) + '\n')

    # 轮播配置
    cfgs = {c.ky: c.vl for c in db.query(N6C).all()}
    with open(os.path.join(MINI_DATA, "banner_data.js"), "w", encoding="utf-8") as f:
        f.write('/** 自动生成 - 修改后台配置后重新同步 */\n')
        f.write('module.exports = ' + json.dumps({"title": cfgs.get("bn_t",""), "sub": cfgs.get("bn_s",""), "body": cfgs.get("bn_body","")}, ensure_ascii=False, indent=2) + '\n')

    return {"ok": True, "svc": len(svcs)}
