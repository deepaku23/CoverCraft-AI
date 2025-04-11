import os
import tempfile
from flask import Flask, render_template, request, jsonify
from werkzeug.utils import secure_filename
import PyPDF2
from docx import Document
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Set up OpenAI with newer SDK style (simplified initialization)
client = OpenAI(
    api_key=os.environ.get("OPENAI_API_KEY"),
)

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

ALLOWED_EXTENSIONS = {'pdf', 'docx', 'doc'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def extract_text_from_pdf(pdf_file):
    reader = PyPDF2.PdfReader(pdf_file)
    text = ""
    for page in reader.pages:
        text += page.extract_text()
    return text

def extract_text_from_docx(docx_file):
    doc = Document(docx_file)
    text = ""
    for para in doc.paragraphs:
        text += para.text + "\n"
    return text

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/extract-text', methods=['POST'])
def extract_text():
    if 'resume' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['resume']
    
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        
        # Create a temporary file
        with tempfile.NamedTemporaryFile(delete=False) as temp:
            file.save(temp.name)
            
            try:
                if filename.endswith('.pdf'):
                    text = extract_text_from_pdf(temp.name)
                elif filename.endswith(('.docx', '.doc')):
                    text = extract_text_from_docx(temp.name)
                else:
                    return jsonify({'error': 'Unsupported file format'}), 400
                
                # Clean up the temporary file
                os.unlink(temp.name)
                
                return jsonify({'text': text})
            except Exception as e:
                # Clean up the temporary file in case of error
                os.unlink(temp.name)
                return jsonify({'error': str(e)}), 500
    
    return jsonify({'error': 'Invalid file type'}), 400

@app.route('/api/generate-cover-letter', methods=['POST'])
def generate_cover_letter():
    data = request.json
    resume_text = data.get('resumeText')
    job_description = data.get('jobDescription')
    
    if not resume_text or not job_description:
        return jsonify({'error': 'Resume text and job description are required'}), 400
    
    try:
        # Create prompt for OpenAI
        prompt = f"""
Generate a professional cover letter based on the following resume and job description:

RESUME:
{resume_text}

JOB DESCRIPTION:
{job_description}

Write a personalized cover letter that highlights the relevant skills and experiences from the resume that match the job requirements. The cover letter should be professional, engaging, and tailored specifically to this position.
"""

        # Call OpenAI API (older style)
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {
                    "role": "system",
                    "content": "You are a professional cover letter writer who creates tailored, compelling cover letters that match a candidate's experience with job requirements."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            max_tokens=1000,
            temperature=0.7
        )
        
        cover_letter = response.choices[0].message.content
        
        return jsonify({'coverLetter': cover_letter})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True) 