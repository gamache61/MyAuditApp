async function runAudit() {
    const codeInput = document.getElementById('codeInput');
    const resultArea = document.getElementById('resultArea');
    
    // 1. Check if user actually pasted code
    if (!codeInput.value.trim()) {
        alert("Please paste some code first!");
        return;
    }

    // 2. Show the loading state
    resultArea.style.display = 'block';
    resultArea.innerText = "⏳ Senior AI is auditing your code... please wait.";
    resultArea.style.color = "var(--accent)";

    try {
        // IMPORTANT: Replace 'YOUR_GEMINI_API_KEY' with your actual key from Google AI Studio
        const API_KEY = 'YOUR_GEMINI_API_KEY'; 
        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `You are a Senior Security Engineer. Audit this code for logic bugs, security flaws, and performance issues. Provide a clear report: ${codeInput.value}`
                    }]
                }]
            })
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        
        // 3. Extract the text from Gemini's response
        if (data.candidates && data.candidates[0].content.parts[0].text) {
            const report = data.candidates[0].content.parts[0].text;
            resultArea.innerText = report;
            resultArea.style.color = "var(--text)";
        } else {
            resultArea.innerText = "⚠️ Gemini sent an empty response. Try different code.";
        }

    } catch (error) {
        // 4. Detailed error logging
        console.error("Audit failed:", error);
        resultArea.innerText = `❌ Error: ${error.message}. Make sure your API key is correct and you have an internet connection.`;
        resultArea.style.color = "#ff4444";
    }
}
