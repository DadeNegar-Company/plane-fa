# Copyright (c) 2023-present Plane Software, Inc. and contributors
# SPDX-License-Identifier: AGPL-3.0-only
# See the LICENSE file for details.

"""
WSGI config for plane project.

It exposes the WSGI callable as a module-level variable named ``application``.

"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "plane.settings.production")

# Boot OpenTelemetry BEFORE creating the WSGI app so DjangoInstrumentor patches
# middleware before the first request lands. Safe no-op if OTLP_ENDPOINT unset.
from plane.utils.telemetry import init_tracer  # noqa: E402
init_tracer()

application = get_wsgi_application()
