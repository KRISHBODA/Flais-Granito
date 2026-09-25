const fs = require('fs');
const path = require('path');

const routesDir = path.join(__dirname, '..', 'routes');

const mappings = {
  'homeRoutes.js': 'home',
  'heroRoutes.js': 'home',
  'seriesLogoRoutes.js': 'home',
  'aboutRoutes.js': 'why-flais',
  'collectionRoutes.js': 'collection',
  'categoryRoutes.js': 'collection',
  'productRoutes.js': 'collection',
  'filterOptionRoutes.js': 'collection',
  'flaisParkRoutes.js': 'flais-park',
  'catalogRoutes.js': 'catalog',
  'flaisGuideRoutes.js': 'achievement',
  'contactRoutes.js': 'contact',
  'blogRoutes.js': 'blog',
  'settingsRoutes.js': 'settings',
  'analyticsRoutes.js': 'analytics',
  'websiteNodeRoutes.js': 'website-files',
};

for (const [file, permission] of Object.entries(mappings)) {
  const filePath = path.join(routesDir, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Add authorize to require if missing
    if (!content.includes('authorize')) {
      content = content.replace(/const { protect } = require\("\.\.\/middleware\/authMiddleware"\);/, 'const { protect, authorize } = require("../middleware/authMiddleware");');
    }

    // Replace protect with protect, authorize("permission")
    // Only in router.post, router.put, router.delete, router.get where protect is used, but watch out for existing authorize
    const regex = /protect(?!,\s*authorize)/g;
    content = content.replace(regex, `protect, authorize("${permission}")`);
    
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
  }
}
