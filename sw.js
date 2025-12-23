// REGISTER SERVICE WORKER
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(reg => console.log('Service Worker Registered'))
            .catch(err => console.log('Service Worker Failed', err));
    });
}

// THEME LOGIC
function toggleTheme() {
    const html = document.documentElement;
    const btn = document.getElementById('themeBtn');
    const current = html.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    btn.innerText = next === 'dark' ? '🌙 Dark' : '☀️ Light';
    localStorage.setItem('theme', next);
}

function loadTheme() {
    const saved = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
    const btn = document.getElementById('themeBtn');
    if(btn) btn.innerText = saved === 'dark' ? '🌙 Dark' : '☀️ Light';
}

// AUDIT LOGIC
async function runAudit() {
    const btn = document.getElementById('auditBtn');
    const code = document.getElementById('codeInput').value;
    const result = document.getElementById('resultArea');
    const copy = document.getElementById('copyBtn');

    if(!code) return alert("Please paste code first!");

    const API_KEY = "AIzaSyDZ795vQTM0ZHuAADRVm_i0q2-stHV8rhw"; 
    const URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

    btn.disabled = true;
    btn.innerText = "Analyzing...";
    result.style.display = "block";
    result.innerText = "Connecting to Gemini AI...";

    try {
        const response = await fetch(URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: "Perform a senior-level code audit. Highlight bugs and provide fix in [brackets]: " + code }] }]
            })
        });
        const data = await response.json();
        if (data.candidates && data.candidates[0]) {
            result.innerText = data.candidates[0].content.parts[0].text;
            copy.style.display = "block";
        }
    } catch (e) {
        alert("Connection failed.");
    } finally {
        btn.disabled = false;
        btn.innerText = "Run Audit";
    }
}

function clearAll() {
    document.getElementById('codeInput').value = '';
    document.getElementById('resultArea').style.display = 'none';
    document.getElementById('copyBtn').style.display = 'none';
}

function copyResult() {
    navigator.clipboard.writeText(document.getElementById('resultArea').innerText);
    alert("Copied!");
}