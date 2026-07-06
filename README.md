# Credits API

A TypeScript Express + MongoDB enterprise-style API for user registration, login, credit purchases, and export usage.

## Features

- User registration with email and password
- User login returning a JWT
- Credit purchase flow using the rule: 3 credits = 1 dollar
- Export endpoint that consumes 1 credit per export
- Response payload includes:
  - name
  - userid
  - email
  - credits
  - canExport
  - datePurchased
  - lowCredit

## Quick start

1. Install dependencies:
   - npm install
2. Copy the environment file:
   - copy .env.example .env
3. Make sure MongoDB is running locally.
4. Start the API:
   - npm run dev

## Endpoints

- POST /api/v1/auth/register
- POST /api/v1/auth/login
- GET /api/v1/auth/me
- POST /api/v1/credits/buy
- POST /api/v1/credits/export

## Example payloads

Register:

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "secret123"
}
```

Purchase credits:

```json
{
  "dollars": 1
}
```
