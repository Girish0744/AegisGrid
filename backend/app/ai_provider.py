import os
import json
from typing import Dict, Any, Optional

from openai import OpenAI


OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"


def call_ai_explanation_agent(context: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    provider_enabled = os.getenv("AI_PROVIDER_ENABLED", "false").lower() == "true"

    if not provider_enabled:
        return None

    api_key = os.getenv("OPENROUTER_API_KEY")
    model = os.getenv("OPENROUTER_MODEL", "openrouter/free")

    if not api_key:
        return None

    try:
        client = OpenAI(
            base_url=OPENROUTER_BASE_URL,
            api_key=api_key,
        )

        response = client.chat.completions.create(
            model=model,
            temperature=0.2,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are an evidence-grounded decision explanation assistant for AegisGrid. "
                        "You do not make decisions. "
                        "You only explain an already-made resource allocation. "
                        "Use only the provided facts. "
                        "Do not invent unavailable details. "
                        "Return valid JSON only."
                    ),
                },
                {
                    "role": "user",
                    "content": build_ai_prompt(context),
                },
            ],
        )

        content = response.choices[0].message.content

        if not content:
            return None

        parsed = json.loads(content)

        parsed["cluster_id"] = context["cluster_id"]
        parsed["resource_id"] = context["resource_id"]
        parsed["trust_status"] = "ai_generated_validated"

        return parsed

    except Exception:
        return None


def build_ai_prompt(context: Dict[str, Any]) -> str:
    return json.dumps(
        {
            "task": "Generate an evidence-grounded decision explanation.",
            "rules": [
                "Use only the provided facts.",
                "Do not invent unavailable details.",
                "Do not change the assigned resource or cluster.",
                "Do not calculate new threat scores.",
                "Do not recommend offensive action.",
                "Return valid JSON only.",
            ],
            "required_output": {
                "cluster_id": context["cluster_id"],
                "resource_id": context["resource_id"],
                "summary": "string",
                "evidence": ["string"],
                "confidence_label": "low | medium | high",
                "if_ignored": "string",
                "trust_status": "ai_generated_validated",
            },
            "facts": context,
        },
        indent=2,
    )