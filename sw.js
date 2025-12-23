/**
 * CORE AUDIT ENGINE
 * This function handles the communication with Gemini, 
 * keeps your API key hidden (eventually), and ensures 
 * the AI acts like a professional auditor.
 */

const API_CONFIG = {
    KEY: "YOUR_NEW_API_KEY_HERE", // Replace this with your new API key
    MODEL: "gemini-1.5-flash",
    // We set temperature very low for consistent, professional audits
    TEMPERATURE: 0.1, 
};

async function runCodeAudit(userProvidedCode) {
    // 1. Validation: Don't send empty code to the AI
    if (!userProvidedCode || userProvidedCode.trim().length < 5) {
        return "Please paste some valid code to audit.";
    }

    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${API_CONFIG.MODEL}:generateContent?key=${API_CONFIG.KEY}`;

    // 2. The "Expert" Instructions
    const systemInstructions = `
        You are a Professional Code Auditor. 
        Your task: Analyze the provided code for bugs, security risks, and efficiency.
        Structure your response exactly like this:
        ## 🚨 Issues Found
        (List the issues here)
        
        ## ✅ Fixed Code
        (Provide the corrected code here in a code block)
        
        ## 💡 Explanation
        (Briefly explain why you made those changes)
    `;

    // 3. Prepare the Request
    const requestPayload = {
        contents: [{
            parts: [{ 
                text: `${systemInstructions}\n\nUSER CODE TO AUDIT:\n${userProvidedCode}` 
            }]
        }],
        generationConfig: {
            temperature: API_CONFIG.TEMPERATURE,
            maxOutputTokens: 2500,
        }
    };

    try {
        // 4. Call the API
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestPayload)
        });

        // 5. Handle Server Issues (Quota, Internet, etc.)
        if (!response.ok) {
            const errorData = await response.json();
            console.error("API Error:", errorData);
            return "The audit service is currently unavailable. Please try again in 1 minute.";
        }

        const data = await response.json();

        // 6. Check if Gemini actually returned a result
        if (data.candidates && data.candidates[0].content) {
            return data.candidates[0].content.parts[0].text;
        } else {
            return "Audit failed: The AI did not return a valid response.";
        }

    } catch (error) {
        // 7. The "Safety Net" for network crashes
        console.error("Network/App Error:", error);
        return "Network error. Please check your internet connection.";
    }
}

// --- EXAMPLE OF HOW TO USE IT ---
/*
runCodeAudit("function test() { var x = 1 }").then(result => {
    console.log(result); // This would display the formatted audit
});
*/
