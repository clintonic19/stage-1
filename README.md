# Overview

This project implements a backend system that:

* Accepts a name input
* Calls three external APIs:

  * Genderize
  * Agify
  * Nationalize
* Applies classification logic
* Stores processed data in MongoDB
* Exposes RESTful endpoints to manage the data

---

## Tech Stack

* **Node.js**
* **Express.js**
* **MongoDB + Mongoose**
* **Axios**
* **UUID (v7)**

---

## 📁 Project Structure

```
stage-1/
│
│   ├── controllers/
│   ├── services/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── middleware/
│   ├── database/
│   └── server.js
```

---

## External APIs Used

* Gender: https://api.genderize.io?name={name}
* Age: https://api.agify.io?name={name}
* Nationality: https://api.nationalize.io?name={name}

---

## API Endpoints

### 1. Create Profile

**POST /api/profiles**


### 2. Get Single Profile

**GET /api/profiles/:id**

### 3. Get All Profiles
**GET /api/profiles**

---

### 4. Delete Profile
**DELETE /api/profiles/:id**

---

## Installation & Setup

### 1. Clone Repo

```
git clone <repo-url>
cd stage-1
```

### 2. Install Dependencies

```
npm install
```
### 3. Run Server

```
npm start
npm run dev 
```

---

## Testing

Use:

* Postman
* Thunder Client

Test scenarios:

* Create profile
* Duplicate request
* Filtering
* Invalid API responses
---
