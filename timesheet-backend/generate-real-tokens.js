const jwt = require('jsonwebtoken');

// Generate real JWT tokens for testing
function generateRealToken(userId, role) {
    const payload = {
        id: userId,
        role: role,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
    };
    
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'supersecretkey');
    return token;
}

console.log('🔑 Generating real JWT tokens for testing...\n');

// Generate tokens for actual employees
const employees = [
    { id: '9d8fa7a7-0a8b-4e19-84f9-3127748ddaf3', name: 'Niranjan Mulam', role: 'Admin' },
    { id: '679709d3-a4f8-44d8-84f2-4a0b41b82fac', name: 'Netrawati Indulkar', role: 'Partner' },
    { id: '5a7859ac-b521-47de-80a4-aef4e4144ad5', name: 'Lisa Wilson', role: 'Employee' }
];

employees.forEach(emp => {
    const token = generateRealToken(emp.id, emp.role);
    console.log(`👤 ${emp.name} (${emp.role})`);
    console.log(`   ID: ${emp.id}`);
    console.log(`   Token: ${token}`);
    console.log('');
});

// Create a simple test HTML with real tokens
const testHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Real JWT Profile Photo Test</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .token-section { background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 10px 0; }
        .token { word-break: break-all; background: #e9ecef; padding: 10px; border-radius: 3px; font-family: monospace; font-size: 12px; }
        button { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; margin: 5px; }
        button:hover { background: #0056b3; }
        .file-input { margin: 10px 0; padding: 10px; border: 2px dashed #ccc; border-radius: 5px; display: block; width: 100%; }
        .result { margin: 20px 0; padding: 15px; border-radius: 5px; font-family: monospace; font-size: 12px; }
        .success { background: #d4edda; color: #155724; }
        .error { background: #f8d7da; color: #721c24; }
    </style>
</head>
<body>
    <h1>🔑 Real JWT Profile Photo Test</h1>
    
    ${employees.map(emp => `
        <div class="token-section">
            <h3>${emp.name} (${emp.role})</h3>
            <p><strong>ID:</strong> ${emp.id}</p>
            <p><strong>Token:</strong></p>
            <div class="token">${generateRealToken(emp.id, emp.role)}</div>
            <button onclick="setToken('${generateRealToken(emp.id, emp.role)}', '${emp.name}')">Use This Token</button>
        </div>
    `).join('')}
    
    <div class="token-section">
        <h3>📤 Upload Test</h3>
        <input type="file" id="profilePhoto" class="file-input" accept=".jpg,.jpeg,.png">
        <button onclick="uploadPhoto()">Upload Profile Photo</button>
        <button onclick="clearAuth()">Clear Auth</button>
        <div id="result"></div>
    </div>

    <script>
        function setToken(token, userName) {
            localStorage.setItem('authToken', token);
            document.getElementById('result').innerHTML = '<div class="success">✅ Token set for ' + userName + '</div>';
        }
        
        function clearAuth() {
            localStorage.removeItem('authToken');
            document.getElementById('result').innerHTML = '<div class="error">🗑️ Token cleared</div>';
        }
        
        function uploadPhoto() {
            const file = document.getElementById('profilePhoto').files[0];
            if (!file) {
                document.getElementById('result').innerHTML = '<div class="error">❌ Please select a file</div>';
                return;
            }
            
            const token = localStorage.getItem('authToken');
            if (!token) {
                document.getElementById('result').innerHTML = '<div class="error">❌ No token set</div>';
                return;
            }
            
            const formData = new FormData();
            formData.append('profilePhoto', file);
            
            document.getElementById('result').innerHTML = '<div class="result">Uploading...</div>';
            
            fetch('http://localhost:5000/api/employees/profile-photo', {
                method: 'PUT',
                headers: { 'Authorization': 'Bearer ' + token },
                body: formData
            })
            .then(res => res.json())
            .then(data => {
                document.getElementById('result').innerHTML = '<div class="success">' + JSON.stringify(data, null, 2) + '</div>';
            })
            .catch(err => {
                document.getElementById('result').innerHTML = '<div class="error">' + err.message + '</div>';
            });
        }
    </script>
</body>
</html>
`;

// Write the test HTML file
const fs = require('fs');
fs.writeFileSync('real-jwt-test.html', testHtml);
console.log('✅ Created real-jwt-test.html with actual JWT tokens');
