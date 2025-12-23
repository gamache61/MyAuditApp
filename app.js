document.getElementById('runAudit').addEventListener('click', () => {
  const resultsContainer = document.getElementById('results');
  resultsContainer.innerHTML = ''; 

  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    chrome.scripting.executeScript({
      target: {tabId: tabs[0].id},
      func: () => document.documentElement.outerHTML
    }, (injectionResults) => {
      const html = injectionResults[0].result;
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      // 1. Missing Alt Text
      doc.querySelectorAll('img').forEach(img => {
        if (!img.hasAttribute('alt')) {
          addError("Image missing alt text");
        }
      });

      // 2. Table Scope
      doc.querySelectorAll('th').forEach(th => {
        if (!th.hasAttribute('scope')) {
          addError("Table headers missing scope attribute");
        }
      });

      // 3. Line Breaks Layout
      if (html.includes('<br><br>') || html.includes('<br /><br />')) {
        addError("Line breaks used for layout");
      }

      // 4. Nav Label
      doc.querySelectorAll('nav').forEach(nav => {
        if (!nav.hasAttribute('aria-label')) {
          addError("Navigation element missing aria-label");
        }
      });

      if (resultsContainer.innerHTML === '') {
        resultsContainer.innerHTML = '<div style="color:green">No issues found!</div>';
      }
    });
  });

  function addError(text) {
    const div = document.createElement('div');
    div.className = 'error';
    div.innerText = text;
    resultsContainer.appendChild(div);
  }
});
