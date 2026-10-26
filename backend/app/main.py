
from fastapi import Depends, FastAPI, HTTPException, Response, Path, Query, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database import Base, engine, get_db
from app.models import User
from app.schemas import UserCreate, UserOut, UserUpdate, ErrorResponse, UserListResponse, UserRole

# Convenient for local learning.
# Use database migrations for production schema changes.
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="User Management API",
    version="1.0.0",
    description=(
        "User CRUD API demonstrating camelCase JSON fields, "
        "validation, pagination, and consistent error responses."
    ),
    servers=[
        {
            "url": "http://localhost:8000",
            "description": "Local development server",
        }
    ],
    contact={
        "name": "API Support",
    },
    openapi_tags=[
        {
            "name": "Users",
            "description": "Operations for managing users.",
        }
    ],
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(HTTPException)
async def http_exception_handler(
    request: Request,
    exc: HTTPException,
):
    messages = {
        404: "NOT_FOUND",
        409: "CONFLICT",
    }

    return JSONResponse(
        status_code=exc.status_code,
        content={
            "errorCode": messages.get(
                exc.status_code,
                "HTTP_ERROR",
            ),
            "message": str(exc.detail),
        },
        headers=exc.headers,
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    request: Request,
    exc: RequestValidationError,
):
    return JSONResponse(
        status_code=422,
        content={
            "errorCode": "VALIDATION_ERROR",
            "message": "Request validation failed",
        },
    )


@app.get(
    "/users",
    response_model=UserListResponse,
    operation_id="listUsers",
    summary="List users",
    description=(
        "Returns users using page-based pagination. "
        "pageSize must be between 1 and 100."
    ),
    tags=["Users"],
    responses={
        422: {"model": ErrorResponse},
    },
)
def list_users(
    page: int = Query(1, ge=1),
    page_size: int = Query(
        20,
        alias="pageSize",
        ge=1,
        le=100,
    ),
    db: Session = Depends(get_db),
):
    total = db.scalar(
        select(func.count()).select_from(User)
    ) or 0

    users = db.scalars(
        select(User)
        .order_by(User.id)
        .offset((page - 1) * page_size)
        .limit(page_size)
    ).all()

    return {
        "items": users,
        "page": page,
        "pageSize": page_size,
        "total": total,
    }


@app.post(
    "/users",
    response_model=UserOut,
    status_code=201,
    operation_id="createUser",
    summary="Create a user",
    description=(
        "Creates a user. The role is assigned by the server."
    ),
    tags=["Users"],
    responses={
        409: {"model": ErrorResponse},
        422: {"model": ErrorResponse},
    },
)
def create_user(
    payload: UserCreate,
    db: Session = Depends(get_db),
):
    user = User(
        name=payload.name,
        email=str(payload.email),
        phone_number=payload.phone_number,
        role=UserRole.USER.value,
        is_active=True,
    )

    db.add(user)

    try:
        db.commit()
        db.refresh(user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="A user with this email already exists",
        )

    return user


@app.put(
    "/users/{userId}",
    response_model=UserOut,
    operation_id="updateUser",
    summary="Update a user",
    description="Replaces the editable fields of an existing user.",
    tags=["Users"],
    responses={
        404: {"model": ErrorResponse},
        409: {"model": ErrorResponse},
        422: {"model": ErrorResponse},
    },
)
def update_user(
    payload: UserUpdate,
    user_id: int = Path(alias="userId", ge=1),
    db: Session = Depends(get_db),
):
    user = db.get(User, user_id)

    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    user.name = payload.name
    user.email = str(payload.email)
    user.phone_number = payload.phone_number
    user.is_active = payload.is_active

    try:
        db.commit()
        db.refresh(user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="A user with this email already exists",
        )

    return user


@app.delete(
    "/users/{userId}",
    status_code=204,
    operation_id="deleteUser",
    summary="Delete a user",
    description="Deletes an existing user permanently.",
    tags=["Users"],
    responses={
        204: {"description": "User deleted successfully"},
        404: {"model": ErrorResponse},
    },
)
def delete_user(
    user_id: int = Path(alias="userId", ge=1),
    db: Session = Depends(get_db),
):
    user = db.get(User, user_id)

    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    db.delete(user)
    db.commit()

    return Response(status_code=204)
