from __future__ import annotations

import logging

from app.core.settings import get_settings

logger = logging.getLogger(__name__)


def configure_observability() -> None:
    settings = get_settings()

    if settings.sentry_dsn:
        try:
            import sentry_sdk
            from sentry_sdk.integrations.fastapi import FastApiIntegration
        except ImportError:
            logger.warning("sentry_sdk is not installed; skipping Sentry initialization")
        else:
            sentry_sdk.init(
                dsn=settings.sentry_dsn,
                integrations=[FastApiIntegration()],
                traces_sample_rate=0.0,
            )

    if settings.posthog_api_key:
        try:
            import posthog
        except ImportError:
            logger.warning("posthog is not installed; skipping PostHog initialization")
        else:
            posthog.project_api_key = settings.posthog_api_key
            posthog.host = settings.posthog_host
