const fs = require('fs');
const path = require('path');
const projectVersion = require('../package.json').version;
const files = process.argv.slice(2);

files.forEach(file => {
    let fillPath = path.join(process.cwd(), file);
    fs.writeFileSync(fillPath, projectVersion);
});
