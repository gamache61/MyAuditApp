document.getElementById('btn-fix-action').onclick = async function() {
    const btn = document.getElementById('btn-fix-action');
    const originalCode = el.input.value.trim();
    
    // 1. Pre-check: Don't even call the API if the box is empty
    if (!originalCode) return;

    btn.innerHTML = '<div class="loader"></div> SAVING QUOTA...';
    btn.disabled = true; // Prevent double-clicking

    try {
        // 2. Strict Instruction: Tell the AI to be honest if it's already fixed
        let res = await callEngine(`Repair this code. IMPORTANT: If no structural or security changes are needed, return the original code EXACTLY. Do not add comments or markdown. Code: ${originalCode}`);
        
        // Clean markdown
        res = res.replace(/^```[a-z]*\n/i, '').replace(/\n```$/i, '').trim();
        
        // 3. THE CIRCUIT BREAKER: Compare 'Before' and 'After'
        // If they are the same, we stop here and DON'T let you loop.
        if (res === originalCode || res.length === 0) {
            log("API GUARD: NO CHANGES DETECTED. QUOTA SAVED.");
            alert("This code is already optimal. No API calls needed.");
            btn.innerHTML = "✨ CODE IS ALREADY FIXED";
            btn.disabled = false;
            return;
        }

        // 4. Success: Only show results if something actually changed
        el.fixResult.textContent = res;
        el.listSec.classList.add('hidden');
        el.resultSec.classList.remove('hidden');
        log("PATCH APPLIED.");
    } catch(e) { 
        log("API ERROR: " + e.message, true); 
    } finally {
        btn.disabled = false;
    }
};