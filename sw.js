const prompt = `Perform a high-precision HTML structural audit. 
Check for:
1. Unclosed tags (like <p>, <h2>, <div>).
2. Incorrect nesting (like <b><p></b>).
3. Malformed tags (like <img src="" ).

If the code has ANY of these technical flaws, list them. 
If and ONLY if the code is 100% syntactically perfect, return [].
Code: ${code}`;
