# Copyright (c) 2023-present Plane Software, Inc. and contributors
# SPDX-License-Identifier: AGPL-3.0-only
# See the LICENSE file for details.

import os

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "plane.settings.production")

# Boot OpenTelemetry BEFORE Django app instantiation so DjangoInstrumentor
# patches middleware before the first request. Safe no-op if OTLP_ENDPOINT unset.
from plane.utils.telemetry import init_tracer  # noqa: E402
init_tracer()

from channels.routing import ProtocolTypeRouter  # noqa: E402
from django.core.asgi import get_asgi_application  # noqa: E402

django_asgi_app = get_asgi_application()

# Initialize Django ASGI application early to ensure the AppRegistry
# is populated before importing code that may import ORM models.


application = ProtocolTypeRouter({"http": get_asgi_application()})
