# WaitMan
## Requirements
Assumes Ubuntu 20.04
 1. Python 3.10
 2. NodeJS 16.x
 3. Postgresql
 4. SSL certificate
## Installation
 1. Install python packages from requirements.txt in backend folder
 2. Using NPM or yarn install node packages in frontend folder
 3. Place SSL certificate files in root directory (by default assumes named key.pem and cert.pem)
 4. Load tables defined in db.sql into a new postgres database
## Configuration
Two configuration files are used, frontend/.env and backend/conf.py
## Running
To run the backend, use:

    python3 server.py
 For the frontend, use:
 

    yarn start
or

    npm start
Database must be running before backend will launch.