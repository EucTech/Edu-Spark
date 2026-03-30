"use client";

import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
config.autoAddCss = false;

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faLock,
  faEye,
  faEyeSlash,
  faArrowRight,
  faSpinner,
  faUserShield,
} from "@fortawesome/free-solid-svg-icons";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // 🔒 STRICT ROLE CHECK
      if (data.user.role !== "admin") {
        throw new Error("This login is for administrators only.");
      }

      // Save session
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("role", data.user.role);
      localStorage.setItem("user", JSON.stringify(data.user));

      router.push("/admin-dashboard");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      {/* Top Bar */}
      <div style={topBarStyle}>
        <Link href="/" style={logoWrapperStyle}>
          <Image
            src="/images/logo-nobg.png"
            alt="EduSpark"
            width={36}
            height={36}
            style={{ objectFit: "contain" }}
            priority
          />
          <span style={logoTextStyle}>
            Edu<span style={{ color: "#3749a9" }}>Spark</span>
          </span>
        </Link>
      </div>

      {/* Main Card */}
      <div style={mainWrapperStyle}>
        <div style={cardStyle}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "28px" }}>
            <FontAwesomeIcon
              icon={faUserShield}
              className="text-3xl text-[#1b2561]"
            />
            <h2 style={titleStyle}>Admin Login</h2>
            <p style={subtitleStyle}>
              Authorized administrators only
            </p>
          </div>

          {/* Error */}
          {error && <div style={errorStyle}>{error}</div>}

          {/* Form */}
          <form
            onSubmit={handleAdminLogin}
            style={{ display: "flex", flexDirection: "column", gap: "20px" }}
          >
            {/* Email */}
            <div>
              <label style={labelStyle}>Admin Email</label>
              <div style={inputWrapperStyle}>
                <FontAwesomeIcon
                  icon={faEnvelope}
                  className="absolute left-3 text-gray-400"
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@email.com"
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={labelStyle}>Password</label>
              <div style={inputWrapperStyle}>
                <FontAwesomeIcon
                  icon={faLock}
                  className="absolute left-3 text-gray-400"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  style={{ ...inputStyle, paddingRight: "45px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={eyeBtnStyle}
                >
                  <FontAwesomeIcon
                    icon={showPassword ? faEyeSlash : faEye}
                    className="text-gray-400"
                  />
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                ...buttonStyle,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin /> Logging in...
                </>
              ) : (
                <>
                  Login as Admin{" "}
                  <FontAwesomeIcon icon={faArrowRight} />
                </>
              )}
            </button>
          </form>

          {/* Back */}
          <p style={backStyle}>
            <Link href="/" style={{ color: "#3749a9", fontWeight: 600 }}>
              ← Back to homepage
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

/* =================== STYLES =================== */

const containerStyle: React.CSSProperties = {
  minHeight: "100vh",
  background: "#f4f6ff",
  display: "flex",
  flexDirection: "column",
};

const topBarStyle: React.CSSProperties = {
  background: "#ffffff",
  borderBottom: "1px solid #e8ecf8",
  padding: "0 24px",
  height: "64px",
  display: "flex",
  alignItems: "center",
};

const logoWrapperStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  textDecoration: "none",
};

const logoTextStyle: React.CSSProperties = {
  fontWeight: 800,
  fontSize: "1.1rem",
  color: "#131b46",
};

const mainWrapperStyle: React.CSSProperties = {
  flex: 1,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "40px 24px",
};

const cardStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: "420px",
  background: "#ffffff",
  borderRadius: "20px",
  padding: "36px 32px",
  boxShadow: "0 4px 32px rgba(19,27,70,0.1)",
  border: "1px solid #e8ecf8",
};

const titleStyle: React.CSSProperties = {
  fontSize: "1.6rem",
  fontWeight: 800,
  marginTop: "10px",
  marginBottom: "4px",
  color: "#0d1333",
};

const subtitleStyle: React.CSSProperties = {
  fontSize: "0.85rem",
  color: "#6b7280",
};

const errorStyle: React.CSSProperties = {
  background: "#fee2e2",
  border: "1px solid #fecaca",
  color: "#b91c1c",
  padding: "10px 14px",
  borderRadius: "10px",
  marginBottom: "16px",
  fontSize: "0.8rem",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.8rem",
  fontWeight: 600,
  marginBottom: "6px",
};

const inputWrapperStyle: React.CSSProperties = {
  position: "relative",
  display: "flex",
  alignItems: "center",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 16px 12px 38px",
  borderRadius: "12px",
  border: "1.5px solid #dde2f5",
  background: "#f8f9ff",
  fontSize: "0.875rem",
  outline: "none",
};

const eyeBtnStyle: React.CSSProperties = {
  position: "absolute",
  right: "12px",
  background: "none",
  border: "none",
  cursor: "pointer",
};

const buttonStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px",
  borderRadius: "12px",
  border: "none",
  background: "linear-gradient(135deg, #1b2561 0%, #3749a9 100%)",
  color: "#ffffff",
  fontWeight: 700,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: "8px",
  marginTop: "6px",
};

const backStyle: React.CSSProperties = {
  textAlign: "center",
  marginTop: "20px",
  fontSize: "0.8rem",
};