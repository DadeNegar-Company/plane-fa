# Copyright (c) 2023-present Plane Software, Inc. and contributors
# SPDX-License-Identifier: AGPL-3.0-only
# See the LICENSE file for details.

# Python imports
import os
import atexit
import logging

# Third party imports
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk.resources import Resource
from opentelemetry.instrumentation.django import DjangoInstrumentor
from opentelemetry.instrumentation.celery import CeleryInstrumentor
from opentelemetry.instrumentation.psycopg import PsycopgInstrumentor
from opentelemetry.instrumentation.redis import RedisInstrumentor
from opentelemetry.instrumentation.requests import RequestsInstrumentor
from opentelemetry.instrumentation.logging import LoggingInstrumentor

# Global variable to track initialization
_TRACER_PROVIDER = None


def init_tracer():
    """Initialize OpenTelemetry with proper shutdown handling.

    Idempotent — safe to call from wsgi.py, asgi.py, celery.py, and the
    instance_traces bgtask. The first call wins; subsequent calls return
    the existing provider.

    Reads from env:
      OTLP_ENDPOINT (required for export — no upstream default, must point
        at our SigNoz collector e.g. http://otel-collector:4317)
      SERVICE_NAME  (e.g. plane-fa-api, plane-fa-worker, plane-fa-beat)
      DEPLOYMENT_VERSION / GIT_SHA  (optional, populates service.version)
      DEPLOYMENT_ENVIRONMENT       (optional, e.g. production)
    """
    global _TRACER_PROVIDER

    # If already initialized, return existing provider
    if _TRACER_PROVIDER is not None:
        return _TRACER_PROVIDER

    otel_endpoint = os.environ.get("OTLP_ENDPOINT")
    if not otel_endpoint:
        # Refuse to silently fall back to upstream Plane telemetry endpoint —
        # that would leak instance metadata to a third party. If observability
        # is intentionally off, just skip init.
        logging.getLogger(__name__).info(
            "OTLP_ENDPOINT not set; OpenTelemetry tracing disabled."
        )
        return None

    # Resource attributes — service name + version + environment for SigNoz UI.
    service_name = os.environ.get("SERVICE_NAME", "plane-fa-api")
    service_version = os.environ.get(
        "DEPLOYMENT_VERSION",
        os.environ.get("GIT_SHA", "0.0.0"),
    )
    deployment_env = os.environ.get("DEPLOYMENT_ENVIRONMENT", "production")

    resource = Resource.create(
        {
            "service.name": service_name,
            "service.version": service_version,
            "deployment.environment": deployment_env,
            "service.namespace": "plane-fa",
        }
    )
    tracer_provider = TracerProvider(resource=resource)
    trace.set_tracer_provider(tracer_provider)

    # OTLP gRPC exporter — collector listens on 4317 in our compose.
    otlp_exporter = OTLPSpanExporter(endpoint=otel_endpoint)
    tracer_provider.add_span_processor(BatchSpanProcessor(otlp_exporter))

    # Auto-instrumentations — order doesn't matter for these, they patch their
    # respective targets on import. instrument_logging injects trace_id into
    # the stdlib logging format so app logs correlate with traces in SigNoz.
    DjangoInstrumentor().instrument()
    CeleryInstrumentor().instrument()
    PsycopgInstrumentor().instrument(enable_commenter=True, commenter_options={})
    RedisInstrumentor().instrument()
    RequestsInstrumentor().instrument()
    # set_logging_format=False keeps Plane's existing JsonFormatter intact;
    # trace_id/span_id are still attached as log record attributes so future
    # formatters or OTel log exporters can pick them up.
    LoggingInstrumentor().instrument(set_logging_format=False)

    _TRACER_PROVIDER = tracer_provider

    atexit.register(shutdown_tracer)

    return tracer_provider


def shutdown_tracer():
    """Shutdown OpenTelemetry tracers and processors"""
    global _TRACER_PROVIDER

    if _TRACER_PROVIDER is not None:
        if hasattr(_TRACER_PROVIDER, "shutdown"):
            _TRACER_PROVIDER.shutdown()
        _TRACER_PROVIDER = None
