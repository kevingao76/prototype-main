# Craftify

The Cratify Platform aims to ease the process for people which search for the right craftsman to help solve their problems.

## Table of Contents


-   [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Application](#running-the-application)
  - [Help](#Help)


## Prerequisites

Ensure you have the following installed on your machine:

- Node.js (>=22.x)
- npm (>=10.x)
- MongoDB
- Docker Compose

### Installation

1. Clone the repository:

   ```sh
   git clone https://gitlab.lrz.de/seba-master-2024/team-13/prototype.git

2. Setup up backend dependencies
    ```sh
      cd backend
      npm install

3. Set up frontend dependencies
    ```sh
      cd frontend
      npm install

- Configure the .env file at /backend/.env:
- Connect your MongoDB URI
- Set JWT_SECRET
- Setup Email API KEY (we propose sendgridAPI)
- Setup Stripe API KEY
- Setup OPENCAGE API KEY

- Configure the /backend/config.js file:
- mongoDBUrl
- dbName
- collectionName (GridFS collection name for the file upload)

### Running the Application

1. Run locally:

- open a terminal and run:
   ```sh
   cd backend
   npm run dev
- Backend is now running under "localhost:8080"

- open a second terminal and run:

   ```sh
   cd frontend
   npm npm start
- Frontend is now running under "localhost:3000"

2. Build and run with Docker

   ```sh
   docker compose up -d

### Help

If you encounter any problem running this project please contact:
- tom.ege@tum.de
- kevin.gao@tum.de
- felix.mengele@tum.de
- leon.weniger@tum.de



