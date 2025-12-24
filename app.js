document.querySelector('button[type="submit"]').addEventListener('click', (event) => {
  event.preventDefault(); // Prevents the page from refreshing
  
  // We scan the document for the 4 issues
  const errors = [];

  // 1. Missing Alt Text
  const images = document.querySelectorAll('img');
  images.forEach(img => {
    if (!img.hasAttribute('alt')) {
      errors.push("Image missing alt text: The element is missing an 'alt' attribute.");
    }
  });

  // 2. Table Header Scope
  const headers = document.querySelectorAll('th');
  headers.forEach(th => {
    if (!th.hasAttribute('scope')) {
      errors.push("Table headers missing scope attribute: Use scope='col' for accessibility.");
    }
  });

  // 3. Line Breaks for Layout
  // We check the raw content for consecutive <br> tags
  const bodyContent = document.body.innerHTML;
  if (bodyContent.includes('<br><br>') || bodyContent.includes('<br /><br />')) {
    errors.push("Line breaks used for layout: Use CSS margins instead of <br> tags.");
  }

  // 4. Nav Label
  const navs = document.querySelectorAll('nav');
  navs.forEach(nav => {
    if (!nav.hasAttribute('aria-label')) {
      errors.push("Navigation element missing aria-label: Provide a label for screen readers.");
    }
  });

  // Display the results
  displayResults(errors);
});

function displayResults(errors) {
  // Check if a results area already exists, if not, create one
  let resultDiv = document.getElementById('audit-results');
  if (!resultDiv) {
    resultDiv = document.createElement('div');
    resultDiv.id = 'audit-results';
    document.body.appendChild(resultDiv);
  }

  resultDiv.innerHTML = '<h3>Audit Results:</h3>';
  
  if (errors.length === 0) {
    resultDiv.innerHTML += '<p style="color: green;">No issues found!</p>';
  } else {
    errors.forEach(err => {
      const p = document.createElement('p');
      p.style.color = 'red';
      p.style.fontWeight = 'bold';
      p.innerText = "• " + err;
      resultDiv.appendChild(p);
    });
  }
}
