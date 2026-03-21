document.addEventListener('DOMContentLoaded', function() {
    // Password visibility toggle functionality
    const toggleButtons = document.querySelectorAll('.toggle-password');
    
    toggleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const input = document.getElementById(targetId);
            
            if (input.type === 'password') {
                input.type = 'text';
                this.innerHTML = `
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                `;
            } else {
                input.type = 'password';
                this.innerHTML = `
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                `;
            }
        });
    });
    
    // Password validation functionality
    const newPasswordInput = document.getElementById('newPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const form = document.querySelector('.password-form');
    const requirements = document.querySelectorAll('.password-requirements li');
    
    // Password validation rules
    const validationRules = [
        { regex: /.{8,}/, index: 0 }, // At least 8 characters
        { regex: /[a-z]/, index: 1 }, // Lowercase letter
        { regex: /[A-Z]/, index: 1 }, // Uppercase letter (same index as lowercase)
        { regex: /\d/, index: 2 }, // Number
        { regex: /[!@#$%^&*(),.?":{}|<>]/, index: 2 } // Special character (same index as number)
    ];
    
    function validatePassword(password) {
        const results = {
            length: password.length >= 8,
            hasLowercase: /[a-z]/.test(password),
            hasUppercase: /[A-Z]/.test(password),
            hasNumber: /\d/.test(password),
            hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };
        
        // Update requirement indicators
        requirements[0].classList.toggle('valid', results.length);
        requirements[1].classList.toggle('valid', results.hasLowercase && results.hasUppercase);
        requirements[2].classList.toggle('valid', results.hasNumber && results.hasSpecial);
        
        return results;
    }
    
    function checkPasswordStrength(password) {
        const validation = validatePassword(password);
        const allValid = validation.length && validation.hasLowercase && validation.hasUppercase && validation.hasNumber && validation.hasSpecial;
        
        newPasswordInput.classList.toggle('valid', allValid);
        newPasswordInput.classList.toggle('invalid', password.length > 0 && !allValid);
        
        return allValid;
    }
    
    function checkPasswordsMatch() {
        const match = newPasswordInput.value === confirmPasswordInput.value && confirmPasswordInput.value.length > 0;
        confirmPasswordInput.classList.toggle('valid', match);
        confirmPasswordInput.classList.toggle('invalid', confirmPasswordInput.value.length > 0 && !match);
        return match;
    }
    
    // Real-time validation
    newPasswordInput.addEventListener('input', function() {
        checkPasswordStrength(this.value);
        if (confirmPasswordInput.value) {
            checkPasswordsMatch();
        }
    });
    
    confirmPasswordInput.addEventListener('input', function() {
        checkPasswordsMatch();
    });
    
    // Form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const isPasswordValid = checkPasswordStrength(newPasswordInput.value);
        const doPasswordsMatch = checkPasswordsMatch();
        
        if (isPasswordValid && doPasswordsMatch) {
            // Simulate password update
            const updateBtn = document.querySelector('.update-btn');
            const originalText = updateBtn.textContent;
            
            updateBtn.textContent = 'Updating...';
            updateBtn.disabled = true;
            
            // Simulate API call
            setTimeout(() => {
                updateBtn.textContent = 'Password Updated!';
                updateBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
                
                setTimeout(() => {
                    // Redirect to sign in page
                    window.location.href = '#sign-in';
                }, 1500);
            }, 1500);
        } else {
            // Show error message
            if (!isPasswordValid) {
                newPasswordInput.classList.add('invalid');
                newPasswordInput.focus();
            } else if (!doPasswordsMatch) {
                confirmPasswordInput.classList.add('invalid');
                confirmPasswordInput.focus();
            }
        }
    });
    
    // Back to sign in link
    document.querySelector('.back-link').addEventListener('click', function(e) {
        e.preventDefault();
        window.location.href = '#sign-in';
    });
});
