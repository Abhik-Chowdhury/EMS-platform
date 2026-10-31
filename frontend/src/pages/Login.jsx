import React, { useState } from 'react'
import { loginPageStyles as s } from '../assets/dummyStyles'
import { ArrowRight, BriefcaseBusiness, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom';
import { saveEmployeeLogin } from '../auth/employeeAuth';
const Login = () => {
    const [form, setForm] = useState({ email: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // to submit the data to server and get logged-in

    const handleSubmit = async (event) => {
        event.preventDefault();

        const cleanEmail = form.email.trim();
        const cleanPassword = form.password.trim();

        if (!cleanEmail || !cleanPassword) {
            setError("Please enter work email and word password");
            return;
        }
        setLoading(true);
        setError("");

        try {
            const response = await fetch(`http://localhost:5000/api/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email: cleanEmail, password: cleanPassword }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Invalid credentials");
                setLoading(false);
                return;
            }

            saveEmployeeLogin({
                email: cleanEmail,
                name: data.name || cleanEmail.split("@")[0],
                role: data.role,
                token: data.token,
                employeeId: data.employeeId || "",
            });
            navigate(location.state?.from?.pathname || "/", { replace: true });
        } catch (error) {
            console.error("Login error:", error);
            setError(
                "Unable to connect to the server. Please check your connection.",
            );
            setLoading(false);
        }
    }


    return (
        <main className={s.mainContainer}>
            <section className={s.section}>
                <div className={s.leftPanel}>
                    <span className={s.leftPanelIcon}>
                        <BriefcaseBusiness size={28} />
                    </span>
                    <p className={s.leftPanelLabel}>Employee Panel</p>
                    <h1 className={s.leftPanelTitle}>
                        Sign in to manage your attendance, leave and payslip.
                    </h1>
                    <div className={s.leftPanelFeatures}>
                        <span className={s.featureItem}>Work email</span>
                        <span className={s.featureItem}>Private employee dashboard</span>
                        <span className={s.featureItem}>Session saved on refresh</span>
                    </div>
                </div>

                {/* login form */}
                <form onSubmit={handleSubmit} className={s.form}>
                    <span className={s.formIcon}>
                        <ShieldCheck size={26} />
                    </span>

                    <p className={s.formLabel}>
                        Welcome Back
                    </p>
                    <h2 className={s.formTitle}>
                        Employee Login
                    </h2>

                    {error && <div className={s.errorBox}>{error}</div>}

                    <label className={s.inputLabel}>
                        <span className={s.inputLabelText}>Work Email</span>
                        <span className={s.inputWrapper}>
                            <Mail className={s.inputIcon} />
                            <input
                                type="email"
                                value={form.email}
                                onChange={(event) => {
                                    setForm({ ...form, email: event.target.value });
                                    setError("");
                                }}
                                placeholder='Enter your Email Id'
                                className={s.inputField}
                            />
                        </span>
                    </label>

                    <label className={s.inputLabel}>
                        <span className={s.inputLabelText}>Work Password</span>
                        <span className={s.inputWrapper}>
                            <LockKeyhole className={s.inputIcon} />
                            <input
                                type={showPassword ? "text" : "password"}
                                value={form.password}
                                onChange={(event) => {
                                    setForm({ ...form, password: event.target.value });
                                    setError("");
                                }}
                                placeholder='Enter Your Password'
                                className={s.inputField}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((current) => !current)}
                                className={s.passwordToggle}
                            >
                                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}

                            </button>
                        </span>

                    </label>
                    <button
                        disabled={loading}
                        className={s.submitButton}
                    >
                        {loading ? (
                            <>
                                <svg
                                    className={s.spinner}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className={s.spinnerCircle}
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    />
                                    <path
                                        className={s.spinnerPath}
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    />
                                </svg>
                                Logging in...
                            </>
                        ) : (
                            <>
                                Login
                                <ArrowRight size={17} />
                            </>
                        )}
                    </button>
                </form>
            </section>
        </main>
    )
}

export default Login