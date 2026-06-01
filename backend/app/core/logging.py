import logging
from logging.config import dictConfig


class StructuredFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        base_message = super().format(record)
        structured_parts = []
        for key in ("request_id", "method", "path", "status_code", "duration_ms"):
            if hasattr(record, key):
                structured_parts.append(f"{key}={getattr(record, key)}")
        if structured_parts:
            return f"{base_message} | {' '.join(structured_parts)}"
        return base_message


def configure_logging() -> None:
    dictConfig(
        {
            "version": 1,
            "disable_existing_loggers": False,
            "formatters": {
                "structured": {
                    "()": StructuredFormatter,
                    "format": "%(asctime)s | %(levelname)s | %(name)s | %(message)s",
                }
            },
            "handlers": {
                "console": {"class": "logging.StreamHandler", "formatter": "structured"}
            },
            "root": {
                "handlers": ["console"],
                "level": logging.INFO,
            },
        }
    )
