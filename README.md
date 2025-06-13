# sourdough_tracker_backend
A backend for a webapp allowing to post and view diffrent stats of villages in the roblox game "Breadwinner World"

## Docker Setup

This project includes Docker configuration for easy deployment and development.

### Prerequisites
- Docker
- Docker Compose

### Quick Start with Docker Compose

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sourdough_tracker_backend
   ```

2. **Set up environment variables**
   Create a `.env` file in the root directory with your configuration:
   ```env
   MONGODB_URI=mongodb://app_user:app_password@mongo:27017/sourdough_tracker
   DB_NAME=sourdough_tracker
   PORT=3000
   NODE_ENV=production
   ```

3. **Build and run with Docker Compose**
   ```bash
   docker-compose up --build
   ```

4. **Access the application**
   - Backend API: http://localhost:3000
   - MongoDB: localhost:27017

### Docker Commands

**Build the Docker image:**
```bash
docker build -t sourdough-tracker-backend .
```

**Run the container:**
```bash
docker run -p 3000:3000 --env-file .env sourdough-tracker-backend
```

**Run in detached mode:**
```bash
docker run -d -p 3000:3000 --env-file .env --name sourdough-backend sourdough-tracker-backend
```

### Development with Docker

For development, you can mount your source code as a volume:

```bash
docker run -p 3000:3000 -v $(pwd):/app --env-file .env sourdough-tracker-backend
```

### Environment Variables

Make sure to set these environment variables in your `.env` file:

- `MONGODB_URI`: MongoDB connection string
- `DB_NAME`: Database name
- `PORT`: Port for the application (default: 3000)
- `NODE_ENV`: Environment (development/production)

### Health Checks

The Docker container includes health checks that verify the application is running properly. You can check the health status with:

```bash
docker ps
```

### Stopping the Application

**With Docker Compose:**
```bash
docker-compose down
```

**With Docker:**
```bash
docker stop sourdough-backend
```

## API Endpoints

### Authentication Endpoints

#### POST /login
Authenticate a user and receive a JWT token.

**Request Body:**
```json
{
  "login": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "message": "Login successful.",
  "user": {
    "login": "user@example.com",
    "roblox_username": "RobloxUsername"
  }
}
```

**Response (401):**
```json
{
  "message": "Invalid credentials."
}
```

#### POST /register
Register a new user account.

**Request Body:**
```json
{
  "username": "RobloxUsername",
  "login": "user@example.com",
  "password": "password123"
}
```

**Response (201):**
```json
{
  "message": "User created successfully."
}
```

**Response (409):**
```json
{
  "message": "User already exists."
}
```

#### GET /verify-token
Verify if the current JWT token is valid.

**Headers:** `Authorization: Bearer <jwt_token>`

**Response (200):**
```json
{
  "valid": true,
  "user": "user@example.com"
}
```

### Village Endpoints

#### GET /
Health check endpoint.

**Response (200):**
```
Server is running
```

#### GET /village
Get a specific village by coordinates.

**Request Body:**
```json
{
  "x": 100,
  "y": 200
}
```

**Response (200):**
```json
{
  "village": {
    "_id": "villlage_id",
    "x": 100,
    "y": 200,
    "mayor": "MayorUsername",
    "name": "Village Name"
  }
}
```

#### GET /villages
Get all villages.

**Response (200):**
```json
{
  "villages": [
    {
      "_id": "village_id",
      "x": 100,
      "y": 200,
      "mayor": "MayorUsername",
      "name": "Village Name"
    }
  ]
}
```

#### POST /villages
Create a new village (requires authentication).

**Headers:** `Authorization: Bearer <jwt_token>`

**Request Body:**
```json
{
  "x": 100,
  "y": 200,
  "mayor": "MayorUsername",
  "name": "Village Name"
}
```

**Response (201):**
```json
{
  "message": "Village created successfully."
}
```

#### PUT /villages
Update an existing village (requires authentication).

**Headers:** `Authorization: Bearer <jwt_token>`

**Request Body:**
```json
{
  "x": 100,
  "y": 200,
  "mayor": "NewMayorUsername",
  "name": "New Village Name"
}
```

**Response (200):**
```json
{
  "message": "Village updated successfully."
}
```

#### DELETE /villages
Delete a village (requires authentication).

**Headers:** `Authorization: Bearer <jwt_token>`

**Request Body:**
```json
{
  "x": 100,
  "y": 200
}
```

**Response (200):**
```json
{
  "message": "Village deleted successfully."
}
```

### Village Stats Endpoints

#### GET /village_stats
Get stats for a specific village.

**Request Body:**
```json
{
  "village_id": "village_object_id"
}
```

**Response (200):**
```json
{
  "stats": [
    {
      "_id": "stat_id",
      "stat_type_id": "stat_type_id",
      "village_id": "village_id",
      "reporter_id": "user_id",
      "report_date_time": "2024-01-01T00:00:00.000Z",
      "value": "stat_value"
    }
  ]
}
```

#### GET /stat_history
Get historical stats for a village and stat type.

**Request Body:**
```json
{
  "village_id": "village_object_id",
  "stat_type_id": "stat_type_object_id"
}
```

**Response (200):**
```json
{
  "stat_history": [
    {
      "_id": "stat_id",
      "stat_type_id": "stat_type_id",
      "village_id": "village_id",
      "reporter_id": "user_id",
      "report_date_time": "2024-01-01T00:00:00.000Z",
      "value": "stat_value"
    }
  ]
}
```

#### POST /village_stats
Add a new village stat (requires authentication).

**Headers:** `Authorization: Bearer <jwt_token>`

**Request Body:**
```json
{
  "stat_type_id": "stat_type_object_id",
  "village_id": "village_object_id",
  "value": "stat_value"
}
```

**Response (200):**
```json
{
  "message": "Village stat added successfully."
}
```

#### PUT /village_stats
Update an existing village stat (requires authentication).

**Headers:** `Authorization: Bearer <jwt_token>`

**Request Body:**
```json
{
  "_id": "stat_object_id",
  "stat_type_id": "stat_type_object_id",
  "village_id": "village_object_id",
  "value": "new_stat_value"
}
```

**Response (200):**
```json
{
  "message": "Village stat updated."
}
```

#### DELETE /village_stats
Delete a village stat (requires authentication).

**Headers:** `Authorization: Bearer <jwt_token>`

**Request Body:**
```json
{
  "_id": "stat_object_id"
}
```

**Response (200):**
```json
{
  "message": "Village stat deleted."
}
```

### Error Responses

All endpoints may return the following error responses:

**400 Bad Request:**
```json
{
  "message": "Validation error",
  "errors": [
    {
      "code": "invalid_type",
      "expected": "string",
      "received": "number",
      "path": ["field_name"],
      "message": "Expected string, received number"
    }
  ]
}
```

**401 Unauthorized:**
```json
{
  "message": "Invalid credentials."
}
```

**403 Forbidden:**
```json
{
  "message": "Insufficient clearance level."
}
```

**404 Not Found:**
```json
{
  "message": "Resource not found."
}
```

**500 Internal Server Error:**
```json
{
  "message": "Internal server error."
}
```

### Authentication

Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

The token is automatically set as an HTTP-only cookie when logging in.

### Data Types

- **ObjectId**: MongoDB ObjectId strings (24 character hex strings)
- **Coordinates**: Integer values for x and y coordinates
- **Email**: Valid email format for login
- **Password**: Minimum 6 characters
- **Username**: Non-empty string

### Troubleshooting

1. **Port already in use**: Change the port mapping in `docker-compose.yml` or stop the service using port 3000
2. **MongoDB connection issues**: Ensure the MongoDB service is running and the connection string is correct
3. **Build failures**: Check that all dependencies are properly listed in `package.json`
4. **Authentication errors**: Make sure you're including the JWT token in the Authorization header
5. **Validation errors**: Check that your request body matches the expected schema format
