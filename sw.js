function performAudit(htmlString) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    const reports = [];

    // 1. Check for Image Alt Text
    const images = doc.querySelectorAll('img');
    images.forEach(img => {
        if (!img.hasAttribute('alt')) {
            reports.push("Image missing alt text: The <img> element is missing an 'alt' attribute.");
        }
    });

    // 2. Check for Table Header Scope
    const ths = doc.querySelectorAll('th');
    ths.forEach(th => {
        if (!th.hasAttribute('scope')) {
            reports.push("Table headers missing scope attribute: The <th> elements are missing 'scope=\"col\"'.");
        }
    });

    // 3. Check for <br> usage in layout
    // This looks for two or more <br> tags in a row
    if (htmlString.includes('<br><br>') || htmlString.includes('<br /><br />')) {
        reports.push("Line breaks used for layout: Consecutive <br> tags are used to create vertical spacing.");
    }

    // 4. Check for Nav aria-label
    const navs = doc.querySelectorAll('nav');
    navs.forEach(nav => {
        if (!nav.hasAttribute('aria-label')) {
            reports.push("Navigation element missing aria-label: The <nav> element does not have an 'aria-label'.");
        }
    });

    return reports;
}
