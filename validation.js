const form = document.getElementById('form')
const name_input = document.getElementById('name-input')
const email_input = document.getElementById('email-input')
const password_input = document.getElementById('password-input')
const repeat_password_input = document.getElementById('repeat-password-input')
const error_message = document.getElementById('error-message')

form.addEventListener('submit', async (e) => {
    e.preventDefault(); // always prevent default initially

    let errors = [];
    let isSignup = name_input !== null; // check if it's signup form

    if (isSignup) {
        errors = getSignupFormErrors(name_input.value, email_input.value, password_input.value, repeat_password_input.value);
    } else {
        errors = getLoginFormErrors(email_input.value, password_input.value);
    }

    if (errors.length > 0) {
        error_message.innerText = errors.join(". ");
        return;
    }

    // Prepare the request
    const endpoint = isSignup ? 'http://localhost:3000/signup' : 'http://localhost:3000/login';
    const body = isSignup
        ? {
            name: name_input.value,
            email: email_input.value,
            password: password_input.value
        }
        : {
            email: email_input.value,
            password: password_input.value
        };

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        const data = await response.json();

        if (response.ok) {
            // ✅ Redirect on success
            if (!isSignup) {
                if (email_input.value === 'deborahalvina@gmail.com') {
                    window.location.href = '/index.html';
                } else {
                    window.location.href = '/info.html';
                }
            } else {
                // If signup is successful, go to index.html
                window.location.href = '/info.html';
            }
        } else {
            // ❌ Show server error messages (e.g., "User already exists" or "Invalid credentials")
            error_message.innerText = data.message || "Something went wrong.";
        }
    } catch (error) {
        console.error('Request failed:', error);
        error_message.innerText = 'Server error. Please try again later.';
    }
});


function getSignupFormErrors(name, email, password, repeatPassword){
    let errors = []
    if(name === '' || name == null){
        errors.push('Name is required')
        name_input.parentElement.classList.add('incorrect')
    }
    if(email === '' || email == null){
        errors.push('Email is required')
        email_input.parentElement.classList.add('incorrect')
    }
    if(password === '' || password == null){
        errors.push('Password is required')
        password_input.parentElement.classList.add('incorrect')
    }
    if((password.length < 8) && !(password === '' || password == null)){
        errors.push('Password must have atleast 8 characters')
        password_input.parentElement.classList.add('incorrect')
        repeat_password_input.parentElement.classList.add('incorrect')
    }
    if(password !== repeatPassword){
        errors.push('Password does not match repeated password')
        password_input.parentElement.classList.add('incorrect')
        repeat_password_input.parentElement.classList.add('incorrect')
    }
    if((repeatPassword === '' || repeatPassword == null) && (password === '' || password == null)){
        errors.push('Repeat Password is required')
        repeat_password_input.parentElement.classList.add('incorrect')
    }
    return errors;
}

function getLoginFormErrors(email, password){
    let errors = []
    if(email === '' || email == null){
        errors.push('Email is required')
        email_input.parentElement.classList.add('incorrect')
    }
    if(password === '' || password == null){
        errors.push('Password is required')
        password_input.parentElement.classList.add('incorrect')
    }
    return errors;
}

const allInputs = [name_input, email_input, password_input, repeat_password_input].filter(input => input != null)
allInputs.forEach(input => {
    input.addEventListener('input', () => {
        if ((allInputs.includes(repeat_password_input)) && input === password_input || input === repeat_password_input) {
            if (password_input.parentElement.classList.contains('incorrect')) {
                password_input.parentElement.classList.remove('incorrect')
                error_message.innerText = ''
            }
            if (repeat_password_input.parentElement.classList.contains('incorrect')) {
                repeat_password_input.parentElement.classList.remove('incorrect')
                error_message.innerText = ''
            }
        } else {
            if (input.parentElement.classList.contains('incorrect')) {
                input.parentElement.classList.remove('incorrect')
                error_message.innerText = ''
            }
        }
    })
})