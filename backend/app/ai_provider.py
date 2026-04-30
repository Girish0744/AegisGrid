import os
import json
from typing import Dict, Any, Optional


OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"
DEFAULT_AI_TIMEOUT_SECONDS = 2.5


def call_ai_explanation_agent(context: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    provider_enabled = os.getenv("AI_PROVIDER_ENABLED", "false").lower() == "true"

    if not provider_enabled:
        return None

    api_key = os.getenv("OPENROUTER_API_KEY")
    model = os.getenv("OPENROUTER_MODEL", "openrouter/free")
    timeout_seconds = float(
        os.getenv("OPENROUTER_TIMEOUT_SECONDS", DEFAULT_AI_TIMEOUT_SECONDS)
    )

    if not api_key:
        return None

    try:
        from openai import OpenAI

        client = OpenAI(
            base_url=OPENROUTER_BASE_URL,
            api_key=api_key,
            timeout=4.0,
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


def call_ai_after_action_agent(report_context: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    api_key = os.getenv("OPENROUTER_API_KEY")
    model = os.getenv("OPENROUTER_MODEL", "openrouter/free")

    if not api_key:
        return None

    try:
        client = OpenAI(
            base_url=OPENROUTER_BASE_URL,
            api_key=api_key,
            timeout=8.0,
        )

        response = client.chat.completions.create(
            model=model,
            temperature=0.2,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You generate evidence-grounded after-action reports for AegisGrid. "
                        "Use only provided metrics. Do not invent facts. "
                        "Return valid JSON only."
                    ),
                },
                {
                    "role": "user",
                    "content": json.dumps({
                        "task": (
                            "Generate a fresh command-level after-action report from this exact AegisGrid run. "
                            "Use the provided baseline metrics, AegisGrid metrics, improvement, detection rate, "
                            "missed detections, verdict, and top threat data. "
                            "Do not reuse generic template language."
                        ),
                        "rules": [
                            "Use actual numbers from the report context.",
                            "Explain what AegisGrid improved and what risk remains.",
                            "Do not invent values.",
                            "Do not output generic boilerplate.",
                        ],
                        "required_output": {
                            "title": "string",
                            "summary": "string",
                            "key_findings": ["string"],
                            "verdict": "string",
                            "trust_status": "ai_generated_validated"
                        },
                        "report_context": report_context,
                    }),
                },
            ],
        )

        content = response.choices[0].message.content
        if not content:
            return None

        parsed = json.loads(content)
        parsed["trust_status"] = "ai_generated_validated"
        return parsed

    except Exception:
        return None
    

def call_ai_snapshot_agent(snapshot_context: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    api_key = os.getenv("OPENROUTER_API_KEY")
    model = os.getenv("OPENROUTER_MODEL", "openrouter/free")

    if not api_key:
        return None

    try:
        client = OpenAI(
            base_url=OPENROUTER_BASE_URL,
            api_key=api_key,
            timeout=8.0,
        )

        response = client.chat.completions.create(
            model=model,
            temperature=0.2,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are an operational analysis assistant for AegisGrid. "
                        "Analyze only the provided snapshot. "
                        "Do not invent facts. "
                        "Do not control or change decisions. "
                        "Return valid JSON only."
                    ),
                },
                {
                    "role": "user",
                    "content": json.dumps({
                        "task": (
                            "Analyze the current AegisGrid operational snapshot. "
                            "Generate a fresh situation analysis based only on this exact snapshot. "
                            "Do not reuse template language. "
                            "Mention the current scenario, top cluster, detection rate, breach risk, "
                            "resource allocation, and the most important operational concern."
                        ),
                        "rules": [
                            "Every response must be specific to the provided snapshot values.",
                            "Use actual cluster IDs, ETA values, threat scores, and risk numbers when available.",
                            "Do not produce generic text.",
                        ],
                        "required_output": {
                            "title": "string",
                            "situation": "string",
                            "primary_risk": "string",
                            "recommended_focus": "string",
                            "evidence": [
                                "specific evidence using actual values from snapshot"
                            ],
                            "trust_status": "ai_generated_validated"
                        },
                        "snapshot": snapshot_context,
                    }),
                },
            ],
        )

        content = response.choices[0].message.content
        if not content:
            return None

        parsed = json.loads(content)
        parsed["trust_status"] = "ai_generated_validated"
        return parsed

    except Exception:
        return None