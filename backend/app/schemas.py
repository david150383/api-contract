from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserCreate(BaseModel):
    first_name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    is_active: bool = True


class UserUpdate(BaseModel):
    first_name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    is_active: bool


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    first_name: str
    email: EmailStr
    is_active: bool
