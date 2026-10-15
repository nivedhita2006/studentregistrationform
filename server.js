const express = require("express");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

const dataFile = path.join(__dirname, "students.json");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: process.env.SESSION_SECRET || "student-project-secret-change-this",
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: "lax"
    }
}));

app.use(express.static(__dirname));

function getStudents() {
    if (!fs.existsSync(dataFile)) {
        fs.writeFileSync(dataFile, "[]");
    }

    return JSON.parse(fs.readFileSync(dataFile, "utf8"));
}

function saveStudents(students) {
    fs.writeFileSync(dataFile, JSON.stringify(students, null, 2));
}

// Home Page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// Registration
app.post("/api/register", async (req, res) => {
    try {
        const {
            name, regno, email, mobile,
            dob, gender, department, password
        } = req.body;

        if (
            !name || !regno || !email || !mobile ||
            !dob || !gender || !department || !password
        ) {
            return res.status(400).json({
                message: "Please fill in all fields."
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                message: "Password must contain at least 8 characters."
            });
        }

        if (!/^\d{10}$/.test(mobile)) {
            return res.status(400).json({
                message: "Enter a valid 10-digit mobile number."
            });
        }

        const students = getStudents();

        const emailExists = students.some(
            student => student.email.toLowerCase() === email.trim().toLowerCase()
        );

        const regnoExists = students.some(
            student => student.regno.toLowerCase() === regno.trim().toLowerCase()
        );

        if (emailExists || regnoExists) {
            return res.status(409).json({
                message: "Email or Register Number already exists."
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const student = {
            id: Date.now().toString(),
            name: name.trim(),
            regno: regno.trim(),
            email: email.trim().toLowerCase(),
            mobile,
            dob,
            gender,
            department,
            password: hashedPassword
        };

        students.push(student);
        saveStudents(students);

        res.status(201).json({
            message: "Registration successful! Please login."
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server error. Please try again."
        });
    }
});

// Login
app.post("/api/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Enter email and password."
            });
        }

        const students = getStudents();

        const student = students.find(
            item => item.email === email.trim().toLowerCase()
        );

        if (!student || !(await bcrypt.compare(password, student.password))) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }

        req.session.studentId = student.id;

        res.json({
            message: "Login successful!"
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server error."
        });
    }
});

// Dashboard Details
app.get("/api/me", (req, res) => {
    if (!req.session.studentId) {
        return res.status(401).json({
            message: "Please login first."
        });
    }

    const student = getStudents().find(
        item => item.id === req.session.studentId
    );

    if (!student) {
        return res.status(401).json({
            message: "Student account not found."
        });
    }

    const { password, ...safeStudent } = student;

    res.json(safeStudent);
});

// Logout
app.post("/api/logout", (req, res) => {
    req.session.destroy(error => {
        if (error) {
            return res.status(500).json({
                message: "Logout failed."
            });
        }

        res.clearCookie("connect.sid");

        res.json({
            message: "Logged out successfully."
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});