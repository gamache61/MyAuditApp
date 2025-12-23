// Theme Management
function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const target = current === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', target);
    localStorage.setItem('theme', target);
}

// Audit Logic
async function runAudit() {
    const code = document.getElementById('codeInput').value;
    const resultArea = document.getElementById('resultArea');
    
    if (!code) {
        alert("Please paste some code first!");
        return;
    }

    resultArea.style.display = 'block';
    resultArea.innerText = "🔍 Auditor is analyzing your code...";

    try {
        // Replace 'YOUR_API_KEY' with your actual Gemini API Key
        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=YOUR_API_KEY', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: "Audit this code for security and logic: " + code }] }]
            })
        });

        const data = await response.json();
        const auditReport = data.candidates[0].content.parts[0].text;
        resultArea.innerText = auditReport;
        
    } catch (error) {
        resultArea.innerText = "❌ Error: Could not connect to the auditor. Check your API key or connection.";
        console.error(error);
    }
}
