document.addEventListener('DOMContentLoaded', function() {
    const MODEL = "gemini-2.5-flash"; 
    let sessionKey = localStorage.getItem('appaudit_key') || "";
    const el = {
        input: document.getElementById('code-in'),
        inputSec: document.getElementById('sec-input'),
        resultSec: document.getElementById('sec-result'),
        status: document.getElementById('status-deck'),
        fixResult: document.getElementById('fix-result'),
        preview: document.getElementById('live-preview'),
        patchNotes: document.getElementById('patch-notes'),
        debug: document.getElementById('debug-log'),
        keyIn: document.getElementById('api-key-input'),
        settings: document.getElementById('settings-modal')
    };

    function log(msg) { el.debug.textContent = `> ${msg}`; }

    function updatePreview(code) {
        const doc = el.preview.contentDocument || el.preview.contentWindow.document;
        doc.open();
        doc.write(code.includes('<html>') ? code : `<html><body style="background:#fff;color:#000;font-family:sans-serif;"><h3>Preview:</h3><script>${code}<\/script><p>Check console if script logic was injected.</p></body></html>`);
        doc.close();
    }

    async function startProcess() {
        if (!sessionKey) { el.settings.style.display = 'flex'; return; }
        const code = el.input.value.trim();
        if (!code) return;

        el.inputSec.classList.add('hidden');
        el.status.style.display = 'block';
        el.status.innerHTML = "Processing...";

        try {
            const prompt = `Return JSON object ONLY: {"fixedCode": "...", "audit": [{"title": "X", "plain": "Y", "severity": "High"}]} Code: ${code}`;
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${sessionKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });

            const json = await response.json();
            const raw = json.candidates[0].content.parts[0].text;
            const data = JSON.parse(raw.substring(raw.indexOf('{'), raw.lastIndexOf('}') + 1));

            el.fixResult.textContent = data.fixedCode;
            updatePreview(data.fixedCode);
            el.patchNotes.innerHTML = data.audit.map(i => `<div style="border-left:4px solid ${i.severity==='High'?'#ff6b6b':'#ff9f43'}; padding:10px; background:#222; margin-bottom:5px;"><b>${i.title}</b>: ${i.plain}</div>`).join('');
            
            el.status.style.display = 'none';
            el.resultSec.classList.remove('hidden');
            log("SUCCESS.");
        } catch (e) {
            log("ERROR: " + e.message);
            el.status.innerHTML = "Error. Check key.";
        }
    }

    document.getElementById('btn-run').onclick = startProcess;
    document.getElementById('btn-save-key').onclick = () => {
        sessionKey = el.keyIn.value.trim();
        localStorage.setItem('appaudit_key', sessionKey);
        el.settings.style.display = 'none';
        log("KEY SAVED.");
    };
    document.getElementById('settings-btn').onclick = () => el.settings.style.display = 'flex';
    document.getElementById('btn-copy').onclick = () => {
        navigator.clipboard.writeText(el.fixResult.textContent);
        log("COPIED.");
    };
});
