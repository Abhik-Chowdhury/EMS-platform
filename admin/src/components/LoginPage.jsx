import React, { useState } from 'react'
import { adminLoginPageStyles as s } from '../assets/dummyStyles';
import { useAuth } from '../auth/useAuth';
import { ArrowRight, BriefcaseBusiness, CheckCircle2, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';

const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const { isAuthenticated, login } = useAuth();
    // routing
    const location = useLocation();
    const navigate = useNavigate();
    const from = location.state?.from?.pathname || "/";

    // for isAuthenticated
    if (isAuthenticated) {
        return <Navigate to={from} replace />;
    }

    // for handleSubmit to submit the data to get logged in
    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setLoading(true);
        try {
            const result = await login({ email, password });

            if (!result.ok) {
                setError(result.message);
                setLoading(false);
                return;
            }
            navigate(from, { replace: true });

        } catch (error) {
            setError("An unexpected error occured. Plese try again.");
            setLoading(false);
        }
    }
    return (
        <main className={s.main}>
            <div className={s.gradientBg} style={s.gradientStyle}></div>
            <section className={s.section}>
                <div className={s.leftPanel}>
                    <div className={s.leftPanelHeader}>
                        <span className={s.leftPanelLogo}>
                            <BriefcaseBusiness className={s.logoIcon} />
                        </span>
                        <div>
                            <p className={s.leftPanelTitle}>EMS Admin</p>
                            <p className={s.leftPanelSubtitle}>Employee System</p>
                        </div>
                    </div>
                    <h1 className={s.leftPanelHeading}>Keep every employee workflow in one clean command center.</h1>
                    <p className={s.leftPanelDescription}>Sign in to manage employee records, attendance, payroll, and team announcements from a protected admin workspace. </p>
                    <div className={s.featureGrid}>
                        {["Protected routes", "Admin dashboard", "Secure session"].map((item) => (
                            <div key={item} className={s.featureCard}>
                                <CheckCircle2 className={s.featureIcon} />
                                <p className={s.featureText}>{item}</p>

                            </div>
                        ),
                        )}
                    </div>
                </div>
                <form onSubmit={handleSubmit} className={s.form}
                >
                    <div className={s.formHeader}>
                        <div className={s.formHeaderLeft}>
                            <span className={s.formHeaderIcon}>
                                <ShieldCheck className={s.formHeaderIconSvg} />
                            </span>
                            <p className={s.formHeaderLabel}>Welcome Back</p>
                            <h2 className={s.formHeaderTitle}>Login to EMS</h2>
                        </div>
                        <span className={s.adminBadge}>Admin</span>
                    </div>

                    {error && <div className={s.errorBox}>{error}</div>}
                    <label className={s.inputLabel}>
                        <span className={s.inputLabelText}>Email address</span>
                        <span className={s.inputWrapper}>
                            <Mail className={s.inputIcon} />
                            <input type="email" value={email} onChange={(event) => {
                                setEmail(event.target.value);
                                setError("");

                            }} className={s.inputField} placeholder="Admin email" />
                        </span>
                    </label>

                    <label className={`${s.inputIcon} ${s.passwordLabel}`}>
                        <span className={s.inputLabelText}>Password</span>
                        <span className={s.inputWrapper}>
                            <LockKeyhole className={s.inputIcon} />
                            <input type={showPassword ? "text" : "password"} value={password} onChange={(event) => {
                                setPassword(event.target.value);
                                setError("");
                            }} className={s.inputField}
                                placeholder="Enter Password"
                            />
                            <button
                                type='button'
                                onClick={() => setShowPassword((current) => !current)}
                                className={s.passwordToggle}
                            >
                                {showPassword ? (
                                    <EyeOff className={s.passwordToggleIcon} />
                                ) : (
                                    <Eye className={s.passwordToggleIcon} />
                                )}

                            </button>
                        </span>
                    </label>

                    <br></br>

                    <button type='submit' className={s.submitButton} disabled={loading}>
                        {loading ? (
                            <>
                                <svg className={s.spinner} fill="none" viewBox="0 0 24 24">
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
                            Login Securely
                            <ArrowRight className={s.submitIcon} />
                            </>
                        )}

                    </button>

                </form>
            </section>

        </main>
    )
}

export default LoginPage