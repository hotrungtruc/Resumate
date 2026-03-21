from typing import Optional
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings


client: Optional[AsyncIOMotorClient] = None


async def connect_to_mongo():
    global client
    if client is None:
        try:
            client = AsyncIOMotorClient(
                settings.MONGO_URI,
                maxPoolSize=10,
                minPoolSize=2,
                retryWrites=True,
                serverSelectionTimeoutMS=5000,
                connectTimeoutMS=10000,
                socketTimeoutMS=30000,
            )
            # Verify connection
            await client.admin.command("ping")
        except Exception as e:
            client = None
            raise RuntimeError(f"Failed to connect to MongoDB: {str(e)}")


async def close_mongo_connection():
    global client
    if client is not None:
        client.close()
        client = None


def get_client() -> AsyncIOMotorClient:
    if client is None:
        raise RuntimeError("Mongo client is not initialized. Please ensure connect_to_mongo() was called during startup.")
    return client
