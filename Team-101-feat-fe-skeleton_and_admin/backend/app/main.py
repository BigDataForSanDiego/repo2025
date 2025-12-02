from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, get_engine
from app.routers import health, dbcheck
from app.routers import admin as admin_router
from app.routers import lookup as lookup_router
from app.routers import qrcode_gen as qrcode_router
from app.routers import auth as auth_router
from app.routers import documents as documents_router
from app.routers import admin_auth
from app import models  # ensure metadata is populated

@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=get_engine())
    yield

app = FastAPI(title=settings.app_name, lifespan=lifespan)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://localhost:3000", "http://localhost:3000"],  # Next.js dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router,  prefix=settings.api_v1_prefix)
app.include_router(dbcheck.router, prefix=settings.api_v1_prefix)
app.include_router(admin_router.router,  prefix=settings.api_v1_prefix)
app.include_router(lookup_router.router, prefix=settings.api_v1_prefix)
app.include_router(qrcode_router.router, prefix=settings.api_v1_prefix)
app.include_router(auth_router.router, prefix=settings.api_v1_prefix)
app.include_router(documents_router.router, prefix=settings.api_v1_prefix)
app.include_router(admin_auth.router)

@app.get("/")
def root():
    return {"ok": True, "service": settings.app_name}
