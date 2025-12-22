document.addEventListener('DOMContentLoaded', function() {
    // 1. Updated Model String
    const MODEL = "gemini-2.5-flash"; 
    let queryCount = 0;
    let sessionKey = localStorage.getItem('appaudit_key') || "";
    if (sessionKey) document.getElementById('api-key-input').value = sessionKey;

    const el = {
        input: document.getElementById('code-in'),
        listSec: document.getElementById('sec-list'),
        inputSec: document.getElementById('sec-input'),
        resultSec: document.getElementById('sec-result'),
        status: document.getElementById('status-deck'),
        issueList: document.getElementById('issue-list'),
        fixResult: document.getElementById('fix-result'),
        debug: document.getElementById('debug-log'),
        settings: document.getElementById('settings-modal'),
        keyIn: document.getElementById('api-key-input'),
        counter: document.getElementById('request-count')
    };

    function log(msg, isError = false) {
        const div = document.createElement('div');
        div.style.color = isError ? 'var(--error)' : '#0f0';
        div.textContent = `> ${msg}`;
        el.debug.appendChild(div);
        el.debug.scrollTop = el.debug.scrollHeight;
    }

    async function callEngine(prompt) {
        if (!sessionKey) { el.settings.style.display = 'flex'; throw new Error("Key Missing"); }
        queryCount++;
        el.counter.innerText = `QUERIES: ${queryCount}`;
        
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${sessionKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        const json = await response.json();

        if (!response.ok) {
            // This pulls the specific error message (e.g., "Model not found")
            const errorMsg = json.error?.message || "Unknown API Error";
            log(`CRITICAL ERROR: ${errorMsg}`, true);
            throw new Error(errorMsg);
        }

        return json.candidates[0].content.parts[0].text;
    }

    async function startAnalysis() {
        const currentCode = el.input.value;
        if (!currentCode) return;

        el.inputSec.classList.add('hidden');
        el.status.style.display = 'block';
        el.status.innerHTML = '<div class="loader"></div> AUDITING VIA 2.5 FLASH...';
        
        try {
            const raw = await callEngine(`Audit this code. Return a JSON array ONLY. 
                Structure: [{"title": "Name", "plain": "Description", "severity": "High"}] 
                If no issues, return []. Code: ${currentCode}`);
            
            // CLEANING LOGIC: Removes Markdown code blocks if the AI includes them
            const cleanedRaw = raw.replace(/```json/g, '').replace(/```/g, '').trim();
            const start = cleanedRaw.indexOf('[');
            const end = cleanedRaw.lastIndexOf(']');
            
            if (start === -1 || end === -1) throw new Error("PARSE_FAIL: Output was not an array");
            
            const issues = JSON.parse(cleanedRaw.substring(start, end + 1));
            
            if (issues.length === 0) {
                log("NO ISSUES FOUND.");
                el.status.innerHTML = '<div style="color:var(--success)">✓ CODE IS OPTIMAL</div><button onclick="location.reload()" class="btn-secondary" style="margin-top:10px;">BACK</button>';
            } else {
                el.status.style.display = 'none';
                el.listSec.classList.remove('hidden');
                el.issueList.innerHTML = issues.map(i => `
                    <div class="issue-card" style="border-left: 4px solid ${i.severity === 'High' ? 'var(--error)' : 'var(--warn)'}">
                        <b>${i.title}</b>
                        <p>${i.plain}</p>
                    </div>`).join('');
                log("AUDIT SUCCESSFUL.");
            }
        } catch (e) { 
            log(`STABILIZATION FAILED: ${e.message}`, true);
            el.status.innerHTML = `<div style="color:var(--error)">Audit Failed: Check Console/Log</div><button onclick="location.reload()" class="btn-secondary" style="margin-top:10px;">RETRY</button>`;
        }
    }

    // Attach Event Listeners
    document.getElementById('btn-analyze').onclick = startAnalysis;
    document.getElementById('btn-erase').onclick = () => { el.input.value = ""; };
    document.getElementById('btn-save-key').onclick = () => { 
        sessionKey = el.keyIn.value.trim(); 
        localStorage.setItem('appaudit_key', sessionKey); 
        el.settings.style.display = 'none'; 
        log("KEY UPDATED."); 
    };
    // Close settings and other UI handlers...
    document.getElementById('btn-close-settings').onclick = () => { el.settings.style.display = 'none'; };
    document.getElementById('settings-btn').onclick = () => { el.settings.style.display = 'flex'; };
});
