# Backend API Documentation

This document outlines the API endpoints available in the GovtTrack India backend, which is built using **Firebase Cloud Functions (v2)**.

## Base URL

All functions are deployed to the `asia-south1` region.
**Base URL**: `https://asia-south1-<YOUR_PROJECT_ID>.cloudfunctions.net`

*(Replace `<YOUR_PROJECT_ID>` with your actual Firebase project ID)*

---

## Authentication

The backend uses Firebase Authentication (ID Tokens).
For **Protected Routes**, you must include the ID Token in the `Authorization` header.

**Header Format:**
```
Authorization: Bearer <FIREBASE_ID_TOKEN>
```

**How to get the token in Frontend (React/Next.js/Flutter):**
```javascript
import { getAuth } from "firebase/auth";

const auth = getAuth();
const user = auth.currentUser;

if (user) {
  const token = await user.getIdToken();
  // Use this token in the header
}
```

---

## API Endpoints

### 1. Health Check
Checks if the backend is reachable and running.

- **Endpoint**: `/healthCheck`
- **Method**: `GET`
- **Auth**: Public
- **Response**:
  ```json
  {
    "status": "alive",
    "timestamp": "2023-10-27T10:00:00.000Z",
    "region": "asia-south1"
  }
  ```

### 2. Get Opportunities
Fetch a list of **verified** government job opportunities. Supports filtering.

- **Endpoint**: `/getOpportunities`
- **Method**: `GET`
- **Auth**: Public
- **Query Parameters**:
  - `state` (optional): Filter by state (e.g., "West Bengal")
  - `qualification` (optional): Filter by qualification (e.g., "10th Pass")
- **Response**:
  ```json
  {
    "opportunities": [
      {
        "id": "doc_id_123",
        "title": "Railway Recruitment 2024",
        "verified": "VERIFIED",
        "officialUrl": "...",
        "state": "All India",
        ...
      }
    ]
  }
  ```

### 3. Get User Tracking
Fetch the opportunities that the currently logged-in user is tracking.

- **Endpoint**: `/getTracking`
- **Method**: `GET`
- **Auth**: **Required**
- **Response**:
  ```json
  {
    "tracking": [
      {
        "userId": "user_uid_123",
        "opportunityId": "doc_id_123",
        "status": "applied"
      }
    ]
  }
  ```

### 4. Update User Tracking
Update the status of an opportunity for the user (e.g., marking it as applied).

- **Endpoint**: `/updateTracking`
- **Method**: `POST`
- **Auth**: **Required**
- **Body**:
  ```json
  {
    "opportunityId": "doc_id_123",
    "status": "applied"
  }
  ```
  *Allowed `status` values: `applied`, `admit_card`, `exam_done`*

- **Response**:
  ```json
  {
    "tracking": { ...saved_tracking_object }
  }
  ```

### 5. Create/Update Opportunity (Admin)
Create or update an opportunity.
> [!WARNING]
> Currently, the code has **Auth Checks Commented Out** (`// 1. Auth Check (Basic Placeholder)`). This endpoint is technically public until the auth logic is uncommented and proper Admin logic is implemented.

- **Endpoint**: `/createOrUpdateOpportunity`
- **Method**: `POST`
- **Auth**: **Should be Admin Only** (Currently Open/Unprotected in code)
- **Body**:
  ```json
  {
    "title": "New Job Post",
    "officialUrl": "https://example.com",
    "description": "Details...",
    "state": "Delhi"
    // ... other fields
  }
  ```
- **Response**:
  ```json
  {
    "message": "Opportunity saved",
    "id": "generated_doc_id"
  }
  ```

---

## Background Triggers (Not Callable via API)

### `publishVerifiedOpportunity`
- **Trigger**: Firestore Write (`opportunities/{docId}`)
- **Logic**: Automatically runs when an opportunity's `verified` status changes to `VERIFIED`. It publishes the opportunity and sends notifications.

### `monitorSources`
- **Trigger**: Schedule (Every 30 minutes)
- **Logic**: Checks configured source URLs for changes to detect new job postings.

---

## Integration Guide for Developer

1.  **Firebase Setup**: Ensure the frontend project is initialized with the same Firebase project configuration.
2.  **Auth State**: Use an `AuthContext` to manage the user's login state and ID token.
3.  **API Client**: Create a wrapper (e.g., `apiClient.js`) that automatically attaches the `Authorization` header if a user is logged in.
    ```javascript
    const apiClient = async (endpoint, options = {}) => {
      const token = await auth.currentUser?.getIdToken();
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      };
      
      const response = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
      return response.json();
    };
    ```
