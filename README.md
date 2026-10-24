# Backend
### Create virtual environment
```
python -m venv .myvenv
```

### Activate virtual environment
```
source .myvenv/bin/activate
```

### Create requirements.txt:
```
fastapi
uvicorn[standard]
sqlalchemy
email-validator
```

### Install dependencies:
```
python -m pip install -r requirements.txt
```

### app/database.py
We'll use SQLAlchemy to communicate with SQLite. This keeps database operations separate from our API routes.

### app/models.py
This file defines the database table.

### app/schemas.py
This is the most important file for our OpenAPI workflow.

Pydantic models define what the API accepts and returns. FastAPI uses these models to generate its OpenAPI schema automatically.


Notice the separation:
- UserCreate: data the frontend must send when creating a user.
- UserUpdate: data the frontend must send when updating a user.
- UserOut: data the backend returns to the frontend.
The frontend should not need to invent these API types independently.


### Start the backend from the backend directory:
```
python -m uvicorn app.main:app --reload
```

### Open these URLs:
- Swagger UI — [test the API](http://localhost:8000/docs)
- [Raw OpenAPI JSON schema](http://localhost:8000/openapi.json)
Try creating a user in Swagger UI. For example:


# Frontend
### Create a new Vite (React) project 
```
npm create vite@latest
```

### Install the form dependencies:
```
npm install react-hook-form zod @hookform/resolvers
```
My current react vite version have some version conflict with @hookform/resolvers latest version so i used a specific version
```
npm install react-hook-form zod @hookform/resolvers@5.9.1
```

### Install client dependencies:
```
npm install @hey-api/client-fetch
npm install -D @hey-api/openapi-ts
```
We used installed above hey dpi dependencies, because we want to create client schema automatically using backend openapi

### Create openapi-ts.config.ts in the frontend directory:
```
import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  input: "http://localhost:8000/openapi.json",
  output: {
    path: "src/api/generated",
  },
  client: "@hey-api/client-fetch",
  plugins: [
    "@hey-api/typescript",
    "@hey-api/sdk",
  ],
});
```

### Add a script to the scripts section of frontend/package.json:
```
"generate:api": "openapi-ts"
```
Keep the existing Vite scripts; just add this entry.

Now run:
```
npm run generate:api
```

The generator reads the live OpenAPI document and writes TypeScript files into src/api/generated. The SDK plugin generates API methods, while the TypeScript plugin generates the associated types.

Your generated output will include equivalents of:
- A listUsers API method.
- A createUser API method.
- An updateUser API method.
- A deleteUser API method.
- TypeScript types for request payloads and response models.

The exact generated filenames and exported symbols depend on the generator version and configuration. **Don't create or edit these files manually.** Inspect the generated exports after running the command.