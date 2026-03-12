# Copyright (c) 2023-present Plane Software, Inc. and contributors
# SPDX-License-Identifier: AGPL-3.0-only
# See the LICENSE file for details.

# Python import
import os
from typing import Tuple

# Third party import
from openai import AuthenticationError, OpenAI, RateLimitError
import requests

from rest_framework import status
from rest_framework.response import Response

# Module import
from plane.app.permissions import ROLE, allow_permission
from plane.app.serializers import ProjectLiteSerializer, WorkspaceLiteSerializer
from plane.db.models import Project, Workspace
from plane.license.utils.instance_value import get_configuration_value
from plane.utils.exception_logger import log_exception

from ..base import BaseAPIView


def get_llm_config() -> Tuple[str | None, str | None, str | None]:
    """
    Helper to get LLM configuration values.
    Returns: (api_key, model, base_url)
    """
    api_key, model, base_url = get_configuration_value(
        [
            {
                "key": "LLM_API_KEY",
                "default": os.environ.get("LLM_API_KEY", None),
            },
            {
                "key": "LLM_MODEL",
                "default": os.environ.get("LLM_MODEL", None),
            },
            {
                "key": "LLM_BASE_URL",
                "default": os.environ.get(
                    "LLM_BASE_URL",
                    os.environ.get("OPENAI_API_BASE", ""),
                ),
            },
        ]
    )

    if not api_key:
        log_exception(ValueError("Missing LLM API key"))
        return None, None, None

    # Default model if not specified
    if not model:
        model = "gpt-4o-mini"

    return api_key, model, base_url or None


def get_llm_response(
    task, prompt, api_key: str, model: str, base_url: str | None = None
) -> Tuple[str | None, str | None]:
    """Helper to get LLM completion response using OpenAI-compatible API"""
    final_text = task + "\n" + prompt
    try:
        client_kwargs = {"api_key": api_key, "timeout": 30.0}
        if base_url:
            client_kwargs["base_url"] = base_url
        client = OpenAI(**client_kwargs)
        chat_completion = client.chat.completions.create(
            model=model, messages=[{"role": "user", "content": final_text}]
        )
        text = chat_completion.choices[0].message.content
        return text, None
    except AuthenticationError:
        return None, "Invalid API key"
    except RateLimitError:
        return None, "Rate limit exceeded"
    except Exception as e:
        log_exception(e)
        return None, "Error occurred while generating response"


class GPTIntegrationEndpoint(BaseAPIView):
    @allow_permission([ROLE.ADMIN, ROLE.MEMBER])
    def post(self, request, slug, project_id):
        api_key, model, base_url = get_llm_config()

        if not api_key or not model:
            return Response(
                {"error": "LLM API key and model are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        task = request.data.get("task", "")
        if not task:
            return Response({"error": "Task is required"}, status=status.HTTP_400_BAD_REQUEST)

        text, error = get_llm_response(
            task, request.data.get("prompt", ""), api_key, model, base_url
        )
        if not text:
            return Response(
                {"error": error or "An internal error has occurred."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        workspace = Workspace.objects.get(slug=slug)
        project = Project.objects.get(pk=project_id)

        return Response(
            {
                "response": text,
                "response_html": text.replace("\n", "<br/>"),
                "project_detail": ProjectLiteSerializer(project).data,
                "workspace_detail": WorkspaceLiteSerializer(workspace).data,
            },
            status=status.HTTP_200_OK,
        )


class WorkspaceGPTIntegrationEndpoint(BaseAPIView):
    @allow_permission(allowed_roles=[ROLE.ADMIN, ROLE.MEMBER], level="WORKSPACE")
    def post(self, request, slug):
        api_key, model, base_url = get_llm_config()

        if not api_key or not model:
            return Response(
                {"error": "LLM API key and model are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        task = request.data.get("task", "")
        if not task:
            return Response({"error": "Task is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Support both prompt and text_input fields (editor AI menu uses text_input)
        prompt = request.data.get("prompt", "") or request.data.get("text_input", "")

        # Incorporate tone scores into task instruction if provided
        casual_score = request.data.get("casual_score")
        formal_score = request.data.get("formal_score")
        if casual_score is not None or formal_score is not None:
            task = f"{task} Use a tone with casual level {casual_score or 0}/10 and formal level {formal_score or 0}/10."

        text, error = get_llm_response(task, prompt, api_key, model, base_url)
        if not text:
            return Response(
                {"error": error or "An internal error has occurred."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response(
            {
                "response": text,
                "response_html": text.replace("\n", "<br/>"),
            },
            status=status.HTTP_200_OK,
        )


class UnsplashEndpoint(BaseAPIView):
    def get(self, request):
        (UNSPLASH_ACCESS_KEY,) = get_configuration_value(
            [
                {
                    "key": "UNSPLASH_ACCESS_KEY",
                    "default": os.environ.get("UNSPLASH_ACCESS_KEY"),
                }
            ]
        )
        # Check unsplash access key
        if not UNSPLASH_ACCESS_KEY:
            return Response([], status=status.HTTP_200_OK)

        # Query parameters
        query = request.GET.get("query", False)
        page = request.GET.get("page", 1)
        per_page = request.GET.get("per_page", 20)

        url = (
            f"https://api.unsplash.com/search/photos/?client_id={UNSPLASH_ACCESS_KEY}&query={query}&page=${page}&per_page={per_page}"
            if query
            else f"https://api.unsplash.com/photos/?client_id={UNSPLASH_ACCESS_KEY}&page={page}&per_page={per_page}"
        )

        headers = {"Content-Type": "application/json"}

        resp = requests.get(url=url, headers=headers)
        return Response(resp.json(), status=resp.status_code)
