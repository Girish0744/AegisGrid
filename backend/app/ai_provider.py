import os
import json
from typing import Dict, Any, Optional


def call_ai_explanation_agent(context: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """
    Optional external AI hook.

    For now, this returns None unless an AI provider is configured.
    This keeps the system safe and demo-stable.
    """

    provider_enabled = os.getenv("AI_PROVIDER_ENABLED", "false").lower() == "true"

    if not provider_enabled:
        return None

    # Placeholder for real API integration.
    # Do NOT let the AI decide allocation.
    # It should only rewrite/explain the already-made decision.
    return None


def build_ai_prompt(context: Dict[str, Any]) -> str:
    return json.dumps(
        {
            "task": "Generate an evidence-grounded decision explanation.",
            "rules": [
                "Use only the provided facts.",
                "Do not invent unavailable details.",
                "Do not change the assigned resource or cluster.",
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