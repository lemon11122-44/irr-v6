from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime
from d6 import B


class N6P(B):
    __tablename__ = "n6_plat"
    id = Column(Integer, primary_key=True, autoincrement=True)
    nm = Column(String(120), nullable=False)
    tp = Column(String(40), default="其他")
    ic = Column(Text, default="")
    ds = Column(Text, default="")
    lk = Column(String(500), default="")
    sq = Column(Integer, default=0)
    sh = Column(Boolean, default=True)
    ct = Column(DateTime, default=datetime.utcnow)


class N6K(B):
    __tablename__ = "n6_know"
    id = Column(Integer, primary_key=True, autoincrement=True)
    tl = Column(String(200), nullable=False)
    sb = Column(String(400), default="")
    bt = Column(String(100), default="了解更多 →")
    bd = Column(Text, default="")                     # 正文（支持分段）
    bg = Column(String(20), default="#FF44BB")
    ul = Column(String(500), default="")
    on = Column(Boolean, default=True)
    ct = Column(DateTime, default=datetime.utcnow)


class N6S(B):
    __tablename__ = "n6_svc"
    id = Column(Integer, primary_key=True, autoincrement=True)
    nn = Column(String(80), nullable=False)
    ph = Column(String(60), default="")
    wx = Column(String(60), default="")               # 微信号
    av = Column(Text, default="")
    ol = Column(Boolean, default=True)
    nt = Column(String(300), default="")
    ct = Column(DateTime, default=datetime.utcnow)


class N6C(B):
    __tablename__ = "n6_cfg"
    id = Column(Integer, primary_key=True, autoincrement=True)
    ky = Column(String(80), unique=True, nullable=False)
    vl = Column(Text, default="")
    ut = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class N6A(B):
    __tablename__ = "n6_adm"
    id = Column(Integer, primary_key=True, autoincrement=True)
    un = Column(String(60), unique=True, nullable=False)
    pw = Column(String(256), nullable=False)
    nk = Column(String(60), default="管理员")
    ct = Column(DateTime, default=datetime.utcnow)
