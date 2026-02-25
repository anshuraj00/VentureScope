console.log("auth.js loaded ✅");


// ---------- NAME ----------
function validateName() {

    const name =
        document.getElementById("name").value.trim();

    const error =
        document.getElementById("nameError");

    const regex=/^[A-Za-z ]{3,30}$/;

    if(!regex.test(name)){
        error.innerText="Only letters (min 3)";
        return false;
    }

    error.innerText="";
    return true;
}


// ---------- EMAIL ----------
function validateEmail(){

    const email =
        document.getElementById("email").value.trim();

    const error =
        document.getElementById("emailError");

    const regex=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if(!regex.test(email)){
        error.innerText="Invalid email";
        return false;
    }

    error.innerText="";
    return true;
}


// ---------- PASSWORD ----------
function validatePassword(){

    const password =
        document.getElementById("password").value;

    const error =
        document.getElementById("passwordError");

    const regex=
/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

    if(!regex.test(password)){
        error.innerText=
        "8+ chars, Upper, Lower, Number, Symbol";
        return false;
    }

    error.innerText="";
    return true;
}


// ---------- REGISTER ----------
async function registerUser(){

    if(
        !validateName() ||
        !validateEmail() ||
        !validatePassword()
    ){
        return;
    }

    const name =
        document.getElementById("name").value.trim();

    const email =
        document.getElementById("email").value.trim();

    const password =
        document.getElementById("password").value;

    try{

        const res = await fetch(
        "/api/users/register",
        {
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({
                name,email,password
            })
        });

        const data = await res.json();

        if(res.ok){
            alert("Registration Successful ✅");
            window.location.href="login.html";
        }
        else{
            document.getElementById("emailError")
            .innerText=data.message;
        }

    }catch(err){
        console.log(err);
        alert("Server Error");
    }
}