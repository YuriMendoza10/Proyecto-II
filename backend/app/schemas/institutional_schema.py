from datetime import datetime

from pydantic import BaseModel, Field


class FacultyBase(BaseModel):
    name: str = Field(..., min_length=3, max_length=180)
    code: str = Field(..., min_length=2, max_length=30)
    description: str | None = None
    is_active: bool = True


class FacultyCreate(FacultyBase):
    pass


class FacultyUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=3, max_length=180)
    code: str | None = Field(default=None, min_length=2, max_length=30)
    description: str | None = None
    is_active: bool | None = None


class FacultyResponse(FacultyBase):
    id: int
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}


class CampusBase(BaseModel):
    name: str = Field(..., min_length=3, max_length=180)
    city: str = Field(..., min_length=3, max_length=120)
    address: str | None = Field(default=None, max_length=240)
    is_active: bool = True


class CampusCreate(CampusBase):
    pass


class CampusUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=3, max_length=180)
    city: str | None = Field(default=None, min_length=3, max_length=120)
    address: str | None = Field(default=None, max_length=240)
    is_active: bool | None = None


class CampusResponse(CampusBase):
    id: int
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}
