document.addEventListener('DOMContentLoaded', function() {
    const MODEL = "gemini-2.5-flash"; 
    let queryCount = 0;
    let sessionKey = localStorage.getItem('appaudit_key') || "";
    if (sessionKey) document.getElementById('api-key-input').value = sessionKey;

    const el = {
        input: document.getElementById('code-in'),
        inputSec: document.getElementById('sec-input'),
        resultSec: document.getElementById('sec-result'),
        status: document.getElementById('status-deck'),
        fixResult: document.getElementById('fix-result'),
        patchNotes: document.getElementById('patch-notes'),
        debug: document.getElementById('debug-log'),
        settings: document.getElementById('settings-modal'),
        keyIn: document.getElementById('api-key-input'),
        counter: document.getElementById('request-count')
    };

    // Service Worker Registration
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('sw.js').then(reg => console.log('SW Registered')).catch(err => console.log('SW Fail'));
        });
    }

    function log(msg, isError = false) {
        const div = document.createElement('div');
        div.style.color = isError ? 'var(--error)' : '#0f0';
        div.textContent = `> ${msg}`;
        el.debug.appendChild(div);
        el.debug.scrollTop = el.debug.scrollHeight;
    }

    async function callEngine(prompt) {
        if (!sessionKey) { el.settings.style.display = 'flex'; throw new Error("API Key Missing"); }
        queryCount++;
        el.counter.innerText = `QUERIES: ${queryCount}`;
        
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${sessionKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        const json = await response.json();
        if (!response.ok) throw new Error(json.error?.message || "API_ERROR");
        return json.candidates[0].content.parts[0].text;
    }

    async function startProcess() {
        const currentCode = el.input.value.trim();
        if (!currentCode) return;
        
        el.inputSec.classList.add('hidden');
        el.status.style.display = 'block';
        el.status.innerHTML = '<div class="loader"></div> 2.5 FLASH: ANALYZING & REPAIRING...';
        
        try {
            const prompt = `Return a JSON object ONLY: {"fixedCode": "...", "audit": [{"title": "X", "plain": "Y", "severity": "High|Low"}]} Target Code: ${currentCode}`;
            const raw = await callEngine(prompt);
            const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();
            const data = JSON.parse(cleaned.substring(cleaned.indexOf('{'), cleaned.lastIndexOf('}') + 1));
            
            // Render Fixed Code
            el.fixResult.textContent = data.fixedCode;
            
            // Optimized Report Rendering using DocumentFragment
            const fragment = document.createDocumentFragment();
            data.audit.forEach(i => {
                const card = document.createElement('div');
                card.className = "issue-card";
                card.style.borderLeftColor = i.severity === 'High' ? 'var(--error)' : 'var(--warn)';
                card.innerHTML = `<b>${i.title}</b>: ${i.plain}`;
                fragment.appendChild(card);
            });
            el.patchNotes.innerHTML = "";
            el.patchNotes.appendChild(fragment);
            
            el.status.style.display = 'none';
            el.resultSec.classList.remove('hidden');
            log("AUTO-FIX SUCCESSFUL.");
        } catch (e) { 
            log(`CRITICAL: ${e.message}`, true);
            el.status.innerHTML = `<div style="color:var(--error)">Process Failed: ${e.message}</div><button onclick="location.reload()" class="btn-secondary" style="margin-top:10px;">RETRY</button>`;
        }
    }

    // UI Bindings
    document.getElementById('btn-run').onclick = startProcess;
    document.getElementById('btn-erase').onclick = () => el.input.value = "";
    document.getElementById('btn-save-key').onclick = () => { 
        sessionKey = el.keyIn.value.trim(); 
        localStorage.setItem('appaudit_key', sessionKey); 
        el.settings.style.display = 'none'; 
        log("KEY SAVED."); 
    };
    document.getElementById('settings-btn').onclick = () => el.settings.style.display = 'flex';
    document.getElementById('btn-close-settings').onclick = () => el.settings.style.display = 'none';
    document.getElementById('btn-new').onclick = () => location.reload();
    document.getElementById('btn-copy').onclick = () => {
        navigator.clipboard.writeText(el.fixResult.textContent);
        log("REPAIRED CODE COPIED.");
    };
});
