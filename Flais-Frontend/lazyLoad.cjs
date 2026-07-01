const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.jsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('./src');
let imgCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const original = content;
  
  // Replace <img ... > with <img loading="lazy" ... >
  content = content.replace(/<img(?![^>]*loading=)([^>]+)>/g, '<img loading="lazy"$1>');
  
  // Add preload="none" to <video> tags
  content = content.replace(/<video(?![^>]*preload=)([^>]+)>/g, '<video preload="none"$1>');
  
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    imgCount++;
  }
});
