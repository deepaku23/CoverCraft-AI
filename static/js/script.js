document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const resumeUpload = document.getElementById('resumeUpload');
    const uploadStatus = document.getElementById('uploadStatus');
    const uploadError = document.getElementById('uploadError');
    const resumePreview = document.getElementById('resumePreview');
    const resumeText = document.getElementById('resumeText');
    const jobDescription = document.getElementById('jobDescription');
    const generateBtn = document.getElementById('generateBtn');
    const generateError = document.getElementById('generateError');
    const resultCard = document.getElementById('resultCard');
    const coverLetterContent = document.getElementById('coverLetterContent');
    const copyBtn = document.getElementById('copyBtn');

    // State
    let extractedResumeText = '';

    // Event listeners
    resumeUpload.addEventListener('change', handleResumeUpload);
    jobDescription.addEventListener('input', updateGenerateButton);
    generateBtn.addEventListener('click', generateCoverLetter);
    copyBtn.addEventListener('click', copyToClipboard);

    // Functions
    function handleResumeUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        const allowedTypes = [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/msword'
        ];

        if (!allowedTypes.includes(file.type)) {
            uploadError.textContent = 'Please upload a PDF or Word document';
            uploadStatus.textContent = '';
            return;
        }

        uploadStatus.textContent = 'Extracting text...';
        uploadError.textContent = '';
        resumePreview.style.display = 'none';

        const formData = new FormData();
        formData.append('resume', file);

        fetch('/api/extract-text', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => {
                    throw new Error(data.error || 'Failed to extract text from resume');
                });
            }
            return response.json();
        })
        .then(data => {
            extractedResumeText = data.text;
            resumeText.textContent = extractedResumeText;
            resumePreview.style.display = 'block';
            uploadStatus.textContent = 'Text extracted successfully!';
            updateGenerateButton();
        })
        .catch(err => {
            uploadError.textContent = err.message;
            uploadStatus.textContent = '';
        });
    }

    function updateGenerateButton() {
        generateBtn.disabled = !extractedResumeText || !jobDescription.value.trim();
    }

    function generateCoverLetter() {
        if (!extractedResumeText || !jobDescription.value.trim()) {
            generateError.textContent = 'Please upload a resume and enter a job description';
            return;
        }

        generateBtn.disabled = true;
        generateBtn.textContent = 'Generating...';
        generateError.textContent = '';
        resultCard.style.display = 'none';

        fetch('/api/generate-cover-letter', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                resumeText: extractedResumeText,
                jobDescription: jobDescription.value
            })
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => {
                    throw new Error(data.error || 'Failed to generate cover letter');
                });
            }
            return response.json();
        })
        .then(data => {
            // Format the cover letter with paragraphs
            const formattedCoverLetter = data.coverLetter.split('\n').map(para => 
                para.trim() ? `<p>${para}</p>` : ''
            ).join('');
            
            coverLetterContent.innerHTML = formattedCoverLetter;
            resultCard.style.display = 'block';
            generateBtn.textContent = 'Generate Cover Letter';
            generateBtn.disabled = false;
        })
        .catch(err => {
            generateError.textContent = err.message;
            generateBtn.textContent = 'Generate Cover Letter';
            generateBtn.disabled = false;
        });
    }

    function copyToClipboard() {
        const coverLetterText = coverLetterContent.innerText;
        navigator.clipboard.writeText(coverLetterText).then(() => {
            const originalText = copyBtn.textContent;
            copyBtn.textContent = 'Copied!';
            setTimeout(() => {
                copyBtn.textContent = originalText;
            }, 2000);
        });
    }
}); 