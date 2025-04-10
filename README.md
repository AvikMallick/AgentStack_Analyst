# AGENStack Analyst

## Project Overview

AGENStack Analyst is an intelligent agent that can answer questions about your data using natural language. It works by:

1. Taking your natural language questions
2. Understanding your database schema 
3. Generating Python queries based on your questions
4. Running these queries directly on your database (ensuring complete data privacy)
5. Returning the results in a clean, tabular format

This is a true agentic application that converts natural language to the correct database query, executes it, and presents the results - all without your data ever leaving your system.

## System Requirements

- Docker (for running the PostgreSQL database)
- Python >= 3.12
- Conda (for environment management)
- Node.js >= 18

## Setup Instructions

### 1. Start the Database

Run the database script to start a PostgreSQL instance in Docker:

```bash
./database.sh
```

This will launch a PostgreSQL database accessible at `postgresql://avik:avik@localhost:5433/datastack`.

### 2. Set Up the Backend

Create and activate a conda environment with Python 3.12:

```bash
# Create a conda environment
conda create -n agstack python=3.12
conda activate agstack

# Navigate to the agstack directory
cd agstack

# Install dependencies
pip install toml
pip install -e .

# Run the FastAPI server
python fastapi_server.py
```

### 3. Set Up the Frontend

```bash
# Navigate to the frontend directory
cd agstack-frontend/frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

### 4. Access the Application

Once both servers are running, navigate to the URL shown in the frontend console output to access the application.

## Features

- Natural language to SQL query conversion
- Direct database querying with privacy protection
- Interactive results display
- Contextual understanding of your database schema 