# NexHire

NexHire is a local AI-powered job application assistant that helps users find jobs, tailor resumes, generate cover letters, prepare for interviews, and track applications.

The entire system runs on the user's computer using Ollama and Llama 3.1, eliminating the need for paid APIs or cloud-based AI services.

---

## Features

### Job Search

* Search jobs from LinkedIn and Indeed
* Search using keywords and location

### AI CV Tailoring

* Upload an existing CV
* Generate a job-specific version of the CV
* Match keywords from the job description

### Cover Letter Generation

* Generate a professional cover letter
* Customize content for the selected role and company

### Match Score Analysis

* Calculate a compatibility score
* Identify matching skills
* Highlight missing skills

### Cold Email Generator

* Generate HR outreach emails
* Open directly in Gmail

### HR Finder

* Suggest possible HR email formats
* Provide LinkedIn and Apollo.io links for recruiter searches

### Interview Preparation

* Generate likely interview questions
* Provide role-specific preparation guidance

### Application Tracker

* Track job applications
* Update application status
* Access saved CVs and cover letters

---

## Technology Stack

| Component    | Technology            |
| ------------ | --------------------- |
| Frontend     | HTML, CSS, JavaScript |
| Backend      | FastAPI               |
| Database     | SQLite                |
| AI Engine    | Ollama (Llama 3.1)    |
| Job Scraping | Selenium              |
| Server       | Uvicorn               |

---

## Requirements

* Python 3.10 or higher
* Google Chrome
* Ollama
* Llama 3.1 Model

---

## Installation

Install the required Python packages:

```bash
pip install fastapi uvicorn selenium webdriver-manager httpx python-dotenv python-multipart requests beautifulsoup4 PyPDF2 python-docx pdfplumber
```

Install the AI model:

```bash
ollama pull llama3.1
```

---

## Running NexHire

Start Ollama:

```bash
ollama serve
```

Start the backend:

```bash
cd backend
python -m uvicorn main:app --reload
```

Open the frontend:

```text
frontend/index.html
```

Or run:

```text
start.bat
```

---

## Project Structure

```text
NexHire/
│
├── start.bat
├── README.md
│
├── backend/
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   ├── .env
│   │
│   ├── ai/
│   │   └── engine.py
│   │
│   ├── routes/
│   │   ├── users.py
│   │   ├── jobs.py
│   │   ├── applications.py
│   │   ├── cv.py
│   │   └── email.py
│   │
│   └── scraper/
│       └── linkedin.py
│
└── frontend/
    ├── index.html
    ├── css/
    │   └── style.css
    │
    └── js/
        ├── api.js
        ├── profile.js
        ├── jobs.js
        ├── dashboard.js
        └── ui.js
```

---

## Status Indicators

| Status | Meaning                             |
| ------ | ----------------------------------- |
| Grey   | Backend not running                 |
| Yellow | Backend running, Ollama unavailable |
| Green  | Backend and AI services operational |

---

## Common Issues

### Uvicorn Not Found

```bash
python -m uvicorn main:app --reload
```

### Ollama Not Found

Reinstall Ollama and restart the system.

### No Jobs Found

* Wait a few minutes and try again
* Use different keywords

### CV Upload Failed

Supported formats:

* PDF
* DOCX
* TXT

---
