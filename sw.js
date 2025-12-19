// Add this to your STATE at the top of the script
let lastCodeHash = "";

async function startAnalysis() {
    currentCode = document.getElementById('code-in').value.trim();
    if(!currentCode) return;

    // Calculate a simple "Hash" to see if the code actually changed from last time
    let currentHash = currentCode.length + currentCode.substring(0,20);
    
    document.getElementById('sec-input').classList.add('hidden');
    const statusDeck = document.getElementById('status-deck');
    statusDeck.style.display = 'block';
    statusDeck.innerText = '> Analyzing...';

    const prompt = `Return ONLY a JSON array. If zero issues, return []. CODE: \n ${currentCode}`;
    
    try {
        const res = await callGemini(prompt);
        const match = res.match(/\[\s*[\s\S]*\s*\]/);
        
        if(match) {
            issues = JSON.parse(match[0]);
            
            // --- THE NOTIFICATION LOGIC ---
            const allLowSeverity = issues.every(i => i.severity.toLowerCase() === 'low' || i.severity.toLowerCase() === 'info');
            
            if (issues.length === 0) {
                statusDeck.innerHTML = "<div style='color:var(--success)'>✅ TARGET REACHED: Code is 100% Clean!</div>";
                return;
            } else if (allLowSeverity && currentHash === lastCodeHash) {
                statusDeck.innerHTML = "<div style='color:var(--warn)'>⚠️ STABILITY REACHED: Only minor suggestions remain. Further fixing may introduce bugs.</div>";
                // Show the list anyway so they can see the minor suggestions
                setTimeout(() => renderListUI(), 2000);
                return;
            }

            lastCodeHash = currentHash; // Save the state for next time
            renderListUI();
        }
    } catch(e) { statusDeck.innerText = "Error: " + e.message; }
}

function renderListUI() {
    document.getElementById('status-deck').style.display = 'none';
    document.getElementById('sec-list').classList.remove('hidden');
    document.getElementById('issue-list').innerHTML = issues.map(i => `
        <div class="issue-card"><b>${i.id}. ${i.title}</b> (${i.severity})<br><small>${i.desc}</small></div>
    `).join('');
}