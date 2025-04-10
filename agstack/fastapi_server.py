#!/usr/bin/env python

import agentops
import agentstack
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.core.database import Base, engine
from src.core.db_init import initialize_database
from src.endpoints.chat import router as chat_router
from src.endpoints.connection import router as connection_router

# Initialize AgentOps without starting a session
agentops.init(auto_start_session=False)

# Initialize database (creates tables if they don't exist)
initialize_database()

app = FastAPI(title="AgStack API", description="API for running AgStack Crew")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(connection_router, prefix="/api/connection", tags=["connection"])
app.include_router(chat_router, prefix="/api/chat", tags=["chat"])


@app.get("/")
async def root():
    """Root endpoint to check if the API is running"""
    return {"message": "AgStack API is running"}


if __name__ == "__main__":
    uvicorn.run("fastapi_server:app", host="0.0.0.0", port=8016, reload=False)
