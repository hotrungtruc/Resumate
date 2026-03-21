from typing import Annotated
from bson import ObjectId
from pydantic.functional_validators import BeforeValidator      


def _validate_object_id(value):
    if isinstance(value, ObjectId):
        return str(value)
    if isinstance(value, str) and ObjectId.is_valid(value):
        return value
    raise ValueError("Invalid ObjectId")


PyObjectId = Annotated[str, BeforeValidator(_validate_object_id)]
