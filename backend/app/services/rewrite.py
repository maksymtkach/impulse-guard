from typing import List
import httpx
from ..config import OPENAI_API_KEY

def _fallback_variants(text: str) -> List[str]:
    t = (text.replace(" never ", " often ")
             .replace(" always ", " usually ")
             .replace(" I don't care", " I want to resolve this"))
    return [
        f"Direct and neutral: {t}. Let's agree on next steps and a clear timeline.",
        f"I feel concerned about this. I'd like to focus on facts and fix it together: {t}",
        "Let's keep it respectful. Proposed plan: 1) … 2) … 3) …",
    ]

async def rewrite_text(text: str) -> List[str]:
    if not OPENAI_API_KEY:
        return _fallback_variants(text)

    prompt = f"""Text (keep original language):
{text}

Produce 3 alternatives:
1) Neutral-Direct (30–80 words)
2) Empathetic (40–90 words, I-statements)
3) Firm Boundaries (30–70 words, no insults)
Preserve dates/amounts/IDs verbatim."""

    try:
        async with httpx.AsyncClient(timeout=20) as client:
            r = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={"Authorization": f"Bearer {OPENAI_API_KEY}", "Content-Type": "application/json"},
                json={
                    "model": "gpt-4o-mini",
                    "messages": [
                        {"role": "system", "content": "You reduce escalation, keep facts, keep it concise."},
                        {"role": "user", "content": prompt},
                    ],
                    "temperature": 0.5,
                },
            )
            data = r.json()
            text_out = (data.get("choices") or [{}])[0].get("message", {}).get("content", "")
            parts = [p.strip() for p in text_out.split("\n") if p.strip()]
            variants, buf = [], []
            for p in parts:
                if p[:2].isdigit() or p.startswith(("1)", "2)", "3)")):
                    if buf:
                        variants.append(" ".join(buf))
                        buf = []
                    continue
                buf.append(p)
            if buf: variants.append(" ".join(buf))
            if not variants: variants = [text_out]
            return variants[:3]
    except Exception:
        return [
            "Direct and neutral: Let's focus on actions and timeline.",
            "Empathetic: I feel concerned; I'd like to resolve this together.",
            "Firm boundaries: Please avoid judgments. Here’s how we proceed: 1) … 2) …",
        ]
