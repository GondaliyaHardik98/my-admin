const fs = require("fs");

// Read TTF file and convert to Base64
const fontData = fs.readFileSync("NotoSansGujarati-Regular.ttf");
const base64Font = fontData.toString("base64");

// Save output to a JS file
const jsFileContent = `const gujaratiFont = "data:font/ttf;base64,${base64Font}";\nexport default gujaratiFont;`;
fs.writeFileSync("NotoSansGujarati-Regular.js", jsFileContent);

console.log("Base64 conversion completed. Check NotoSansGujarati-Regular.js");
