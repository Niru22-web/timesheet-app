const fs = require('fs');
const path = require('path');

// Find all files with double /api issues and fix them
const fixDoubleApi = () => {
  const frontendDir = 'c:\\Users\\Niranjan\\Desktop\\Web app\\timesheet-frontend\\src';
  
  const filesToFix = [
    'pages\\Clients.tsx',
    'pages\\Jobs.tsx', 
    'pages\\LeaveManagement.tsx',
    'pages\\Projects.tsx',
    'pages\\Timesheet.tsx',
    'pages\\Profile.tsx'
  ];
  
  filesToFix.forEach(file => {
    const filePath = path.join(frontendDir, file);
    
    try {
      if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Replace all occurrences of /api/ with / in API calls
        const originalContent = content;
        content = content.replace(/API\.(get|post|put|delete)\(`\/api\//g, 'API.$1(`/');
        
        if (content !== originalContent) {
          fs.writeFileSync(filePath, content);
          console.log(`✅ Fixed double /api in ${file}`);
        } else {
          console.log(`ℹ️  No double /api found in ${file}`);
        }
      } else {
        console.log(`❌ File not found: ${filePath}`);
      }
    } catch (error) {
      console.log(`❌ Error fixing ${file}:`, error.message);
    }
  });
  
  console.log('\n🎉 Double /api fix completed!');
};

fixDoubleApi();
