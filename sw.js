function runAudit(htmlString) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    const results = [];

    // 1. Image missing alt text
    const images = doc.querySelectorAll('img');
    images.forEach(img => {
        if (!img.hasAttribute('alt')) {
            results.push({
                issue: "Image missing alt text",
                details: "The <img> element is missing an 'alt' attribute, which is crucial for accessibility."
            });
        }
    });

    // 2. Table headers missing scope attribute
    const headers = doc.querySelectorAll('th');
    headers.forEach(th => {
        if (!th.hasAttribute('scope')) {
            results.push({
                issue: "Table headers missing scope attribute",
                details: "The <th> elements within the table's <thead> are missing the 'scope' attribute (e.g., 'scope=\"col\"')."
            });
        }
    });

    // 3. Line breaks used for layout
    // This checks the raw string for consecutive <br> tags
    if (/<br\s*\/?>\s*<br\s*\/?>/.test(htmlString)) {
        results.push({
            issue: "Line breaks used for layout",
            details: "Consecutive <br> tags are used to create vertical spacing. Layout should be controlled using CSS."
        });
    }

    // 4. Navigation element missing aria-label
    const navs = doc.querySelectorAll('nav');
    navs.forEach(nav => {
        if (!nav.hasAttribute('aria-label')) {
            results.push({
                issue: "Navigation element missing aria-label",
                details: "The <nav> element does not have an 'aria-label' attribute to describe its purpose."
            });
        }
    });

    return results;
}
