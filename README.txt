====================================================
        NexHire - AI Job Application System
====================================================

WHAT IS NEXHIRE?
----------------
NexHire is a free AI tool that runs completely on
your own computer. It helps you apply for jobs faster
by automatically tailoring your CV and writing cover
letters for each job you apply to.


FEATURES
--------
1. Job Search
   - Searches real jobs from LinkedIn and Indeed
   - Just type a keyword and location

2. AI CV Tailoring
   - Upload your CV once
   - AI rewrites it specifically for each job
   - Matches keywords from the job description

3. Cover Letter Generator
   - AI writes a professional cover letter
   - Customized for each job and company

4. Match Score
   - Shows 0-100% how well you fit the job
   - Lists your matching and missing skills

5. Cold Email Generator
   - AI writes a short email to send to HR
   - Opens directly in Gmail when ready

6. HR Finder
   - Guesses possible HR email addresses
   - Gives you LinkedIn and Apollo.io links
     to find the real HR contact

7. Interview Preparation
   - AI generates likely interview questions
   - Gives you tips specific to the job

8. Application Tracker
   - Dashboard showing all your applications
   - Update status: Applied, Interview, Offer, Rejected
   - View saved CV and cover letter anytime


HOW IT WORKS
------------
- AI Engine  : Ollama running Llama 3.1 (free, local)
- Backend    : FastAPI Python server
- Database   : SQLite (saves everything on your PC)
- Scraping   : Selenium controls Chrome browser
- Frontend   : Opens in your web browser


REQUIREMENTS
------------
Before running NexHire, make sure you have:

  1. Python 3.10 or higher
  2. Google Chrome browser
  3. Ollama installed with Llama 3.1 model
  4. Required Python packages (listed below)


HOW TO CHECK WHAT IS INSTALLED
-------------------------------
Open Command Prompt (Win + R, type cmd, Enter)
and run these commands:

  Check Python:
    python --version
    (Should show Python 3.10 or higher)

  Check Ollama:
    ollama --version
    (Should show a version number)

  Check Llama model:
    ollama list
    (Should show llama3.1 in the list)

  Check Python packages:
    pip show fastapi uvicorn selenium


INSTALLING OLLAMA (if not installed)
-------------------------------------
1. Go to: https://ollama.com/download/windows
2. Download OllamaSetup.exe
3. Install it (Next, Next, Finish)
4. Restart your PC
5. Open CMD and run:
     ollama pull llama3.1
   (This downloads the AI model - about 4GB)
   (Wait for it to finish - takes 10-30 minutes)


INSTALLING PYTHON PACKAGES (if missing)
-----------------------------------------
Open CMD and run this single command:

  pip install fastapi uvicorn selenium webdriver-manager httpx python-dotenv python-multipart requests beautifulsoup4 PyPDF2 python-docx pdfplumber


WHAT EACH PACKAGE DOES
-----------------------
  fastapi          - Web server
  uvicorn          - Runs the server
  selenium         - Scrapes LinkedIn and Indeed
  webdriver-manager- Downloads ChromeDriver automatically
  httpx            - Connects to Ollama AI
  python-dotenv    - Reads config settings
  python-multipart - Handles CV file uploads
  requests         - Makes web requests
  beautifulsoup4   - Reads scraped web pages
  PyPDF2           - Reads PDF files
  python-docx      - Reads Word DOCX files
  pdfplumber       - Better PDF reading (backup)


HOW TO RUN NEXHIRE
-------------------
You need 3 things running at the same time:

  Step 1 - Open CMD window 1 and run:
    ollama serve

  Step 2 - Open CMD window 2 and run:
    cd D:\NexHire\backend
    python -m uvicorn main:app --reload

  Step 3 - Open frontend\index.html in Chrome

Or just double-click start.bat to do all of this
automatically.


HOW TO USE
----------
  Tab 1 - Profile:
    Fill your name, email, skills, location.
    Upload your CV (PDF or DOCX) or paste the text.
    Click Save Profile.

  Tab 2 - Find Jobs:
    Type a job title and location.
    Choose LinkedIn or Indeed.
    Click Search Jobs and wait 15-30 seconds.
    Click AI Tailor CV on any job you like.
    AI will generate your tailored CV, cover letter,
    and match score.
    Click Cold Email to write an HR outreach email.

  Tab 3 - Dashboard:
    See all applications in one place.
    Update status for each application.
    View saved CV and cover letter anytime.


STATUS DOT (top right of the app)
-----------------------------------
  Grey dot  = Backend is not running
  Yellow dot = Backend runs but Ollama is offline
  Green dot  = Everything is working correctly


COMMON ERRORS AND FIXES
------------------------
  Error: uvicorn is not recognized
  Fix:   python -m uvicorn main:app --reload

  Error: ollama is not recognized
  Fix:   Reinstall Ollama and restart your PC

  Error: No jobs found
  Fix:   Wait 1-2 minutes and try again
         Try different keywords

  Error: AI Tailor not working
  Fix:   Make sure ollama serve is running
         Check green dot in top right

  Error: CV upload failed
  Fix:   Use PDF, DOCX, or TXT only
         Or paste CV text manually


FOLDER STRUCTURE
----------------
  NexHire/
  |-- start.bat              (double-click to start)
  |-- README.txt             (this file)
  |-- backend/
  |   |-- main.py            (server entry point)
  |   |-- database.py        (saves your data)
  |   |-- models.py          (data structure)
  |   |-- .env               (settings)
  |   |-- ai/
  |   |   |-- engine.py      (AI functions)
  |   |-- routes/
  |   |   |-- users.py       (profile saving)
  |   |   |-- jobs.py        (job search)
  |   |   |-- applications.py(tracker)
  |   |   |-- cv.py          (CV upload)
  |   |   |-- email.py       (cold email)
  |   |-- scraper/
  |       |-- linkedin.py    (LinkedIn + Indeed)
  |-- frontend/
      |-- index.html         (open in browser)
      |-- css/style.css      (visual design)
      |-- js/
          |-- api.js         (backend connection)
          |-- profile.js     (profile page)
          |-- jobs.js        (job search page)
          |-- dashboard.js   (tracker page)
          |-- ui.js          (navigation)


====================================================
  NexHire v2.0 | Free | Local | No API Keys Needed
====================================================
