import time
import logging
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("quantx-audit")

class AuditLogMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        
        # In a real system, you would extract the user context here (e.g. from token)
        client_ip = request.client.host if request.client else "unknown"
        method = request.method
        url = str(request.url)
        
        response = await call_next(request)
        
        process_time = time.time() - start_time
        
        # Log the action (Audit Trail)
        logger.info(
            f"AUDIT | IP: {client_ip} | Method: {method} | "
            f"URL: {url} | Status: {response.status_code} | "
            f"Time: {process_time:.4f}s"
        )
        
        return response
