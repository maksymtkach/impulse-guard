from typing import Optional
from fastapi import APIRouter
from ..schemas import RewriteIn
from ..services.rewrite import rewrite_text

router = APIRouter()

@router.post("/rewrite")
async def rewrite(inp: RewriteIn):
    variants = await rewrite_text(inp.text)
    return {"variants": variants}
