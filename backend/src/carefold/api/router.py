"""Master API Router mounting all Carefold endpoints."""

from fastapi import APIRouter

from carefold.api.agents import router as agents_router
from carefold.api.attachments import router as attachments_router
from carefold.api.audit import router as audit_router
from carefold.api.chat import router as chat_router
from carefold.api.health import router as health_router
from carefold.api.models import router as models_router
from carefold.api.skills import router as skills_router

api_router = APIRouter()
api_router.include_router(health_router)
api_router.include_router(agents_router)
api_router.include_router(skills_router)
api_router.include_router(audit_router)
api_router.include_router(chat_router)
api_router.include_router(models_router)
api_router.include_router(attachments_router)

__all__ = ["api_router"]
