from fastapi import APIRouter, Depends, Form, HTTPException, Request
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session
from d6 import gb
from m6 import N6A
from a6 import h, c, mk, rd
import os

rt = APIRouter(prefix="/adm", tags=["Admin"])
tp = Jinja2Templates(directory=os.path.join(os.path.dirname(__file__), "..", "t6"))

def gr(rq):
    t = rq.cookies.get("n6t")
    if not t: raise HTTPException(401)
    d = rd(t)
    if d.get("r") != "n6": raise HTTPException(401)

@rt.get("/login", response_class=HTMLResponse)
def lg(rq: Request, err: str = ""):
    return tp.TemplateResponse(rq, "p6.html", {"tab": "login", "err": err})

@rt.post("/login")
def dlg(rq: Request, username: str = Form(...), password: str = Form(...), db: Session = Depends(gb)):
    ad = db.query(N6A).filter(N6A.un == username).first()
    if not ad or not c(password, ad.pw):
        return tp.TemplateResponse(rq, "p6.html", {"tab": "login", "err": "账号或密码错误"})
    tok = mk(ad.id)
    resp = RedirectResponse(url="/adm/p", status_code=302)
    resp.set_cookie("n6t", tok, path="/", max_age=604800)
    return resp

@rt.get("/p", response_class=HTMLResponse)
def dp(rq: Request):
    try: gr(rq)
    except: return RedirectResponse(url="/adm/login?err=请先登录", status_code=302)
    return tp.TemplateResponse(rq, "p6.html", {"tab": "dash"})

@rt.get("/plat", response_class=HTMLResponse)
def plat(rq: Request):
    try: gr(rq)
    except: return RedirectResponse(url="/adm/login?err=请先登录", status_code=302)
    return tp.TemplateResponse(rq, "p6.html", {"tab": "plat"})

@rt.get("/know", response_class=HTMLResponse)
def know(rq: Request):
    try: gr(rq)
    except: return RedirectResponse(url="/adm/login?err=请先登录", status_code=302)
    return tp.TemplateResponse(rq, "p6.html", {"tab": "know"})

@rt.get("/cfg", response_class=HTMLResponse)
def cfg(rq: Request):
    try: gr(rq)
    except: return RedirectResponse(url="/adm/login?err=请先登录", status_code=302)
    return tp.TemplateResponse(rq, "p6.html", {"tab": "cfg"})

@rt.get("/svc", response_class=HTMLResponse)
def svc(rq: Request):
    try: gr(rq)
    except: return RedirectResponse(url="/adm/login?err=请先登录", status_code=302)
    return tp.TemplateResponse(rq, "p6.html", {"tab": "svc"})

@rt.get("/q")
def q():
    resp = RedirectResponse(url="/adm/login", status_code=302)
    resp.delete_cookie("n6t")
    return resp
