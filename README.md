# CoverCraft AI

An intelligent cover letter generator that transforms your resume and job description into professionally tailored cover letters using AI.

## Features

- Extract text from PDF and Word resumes
- Analyze job descriptions
- Generate custom cover letters with OpenAI's GPT
- Copy-to-clipboard functionality
- Clean, responsive interface

## Setup

1. Clone the repository
2. Create a virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```
4. Add OpenAI API key to `.env` file:
   ```
   OPENAI_API_KEY=your_api_key_here
   ```
5. Run the application:
   ```
   python app.py
   ```
6. Visit http://localhost:5000

## Usage

1. Upload resume (PDF/Word)
2. Enter job description
3. Generate cover letter
4. Copy or save the result

## Technologies

- Flask backend
- PyPDF2/python-docx for document parsing
- OpenAI GPT API
- HTML/CSS/JS frontend
