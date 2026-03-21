from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import FastAPI
from fastapi.responses import JSONResponse


# Create limiter instance
limiter = Limiter(key_func=get_remote_address)


def setup_rate_limiter(app: FastAPI):
    """Setup rate limiter on FastAPI app"""
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, rate_limit_exception_handler)


async def rate_limit_exception_handler(request, exc):
    """Custom handler for rate limit exceeded errors"""
    return JSONResponse(
        status_code=429,
        content={
            "detail": "Rate limit exceeded. Please try again later.",
            "retry_after": exc.retry_after if hasattr(exc, 'retry_after') else None
        }
    )
