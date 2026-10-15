// STUDENT REGISTRATION
const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const message = document.getElementById("message");
        const password = document.getElementById("password").value;
        const confirmPassword =
            document.getElementById("confirmPassword").value;

        if (password !== confirmPassword) {
            message.textContent = "Passwords do not match!";
            message.style.color = "red";
            return;
        }

        const student = {
            name: document.getElementById("name").value.trim(),
            regno: document.getElementById("regno").value.trim(),
            email: document.getElementById("email").value.trim(),
            mobile: document.getElementById("mobile").value.trim(),
            dob: document.getElementById("dob").value,
            gender: document.getElementById("gender").value,
            department: document.getElementById("department").value,
            password: password
        };

        try {
            const response = await fetch("/api/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(student)
            });

            const result = await response.json();

            message.textContent = result.message;
            message.style.color = response.ok ? "green" : "red";

            if (response.ok) {
                registerForm.reset();
            }
        } catch (error) {
            message.textContent = "Unable to connect to server.";
            message.style.color = "red";
        }
    });
}


// STUDENT LOGIN
const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const message = document.getElementById("loginMessage");

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        try {
            const response = await fetch("/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            });

            const result = await response.json();

            if (response.ok) {
                window.location.href = "/dashboard.html";
            } else {
                message.textContent = result.message;
                message.style.color = "red";
            }
        } catch (error) {
            message.textContent = "Unable to connect to server.";
            message.style.color = "red";
        }
    });
}


// STUDENT DASHBOARD
const studentDetails = document.getElementById("studentDetails");

if (studentDetails) {
    async function loadDashboard() {
        try {
            const response = await fetch("/api/me");

            if (!response.ok) {
                window.location.href = "/index.html";
                return;
            }

            const student = await response.json();

            studentDetails.replaceChildren();

            const fields = [
                ["Full Name", student.name],
                ["Register Number", student.regno],
                ["Email", student.email],
                ["Mobile", student.mobile],
                ["Date of Birth", student.dob],
                ["Gender", student.gender],
                ["Department", student.department]
            ];

            fields.forEach(([label, value]) => {
                const row = document.createElement("p");
                const strong = document.createElement("strong");

                strong.textContent = label + ": ";
                row.append(strong, document.createTextNode(value || ""));
                studentDetails.appendChild(row);
            });
        } catch (error) {
            studentDetails.textContent = "Unable to load student details.";
        }
    }

    loadDashboard();
}


// LOGOUT
const logoutButton = document.getElementById("logoutButton");

if (logoutButton) {
    logoutButton.addEventListener("click", async function () {
        try {
            const response = await fetch("/api/logout", {
                method: "POST"
            });

            if (response.ok) {
                window.location.replace("/index.html");
            } else {
                alert("Logout failed. Please try again.");
            }
        } catch (error) {
            alert("Unable to connect to server.");
        }
    });
}