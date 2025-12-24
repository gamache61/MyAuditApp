async function callEngine(prompt) {
    if (!sessionKey) { el.settings.style.display = 'flex'; throw new Error("Key Missing"); }
    
    // Fallback URL if 2.5-flash is being stubborn
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${sessionKey}`;
    
    log("Requesting Gemini 2.5...");

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                contents: [{ parts: [{ text: prompt }] }]
            })
        });
        
        const json = await res.json();
        
        if (!res.ok) {
            // Check for the specific "Quota" or "Model" error
            log(`SERVER REJECTED: ${json.error.message}`);
            if(json.error.message.includes("not found")) {
                log("HINT: Try changing model to 'gemini-1.5-flash' in settings.");
            }
            throw new Error(json.error.message);
        }
        
        return json.candidates[0].content.parts[0].text;
    } catch (e) {
        log(`CONNECTION LOST: ${e.message}`);
        throw e;
    }
}
