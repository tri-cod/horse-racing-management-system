// login.jsx - Trang đăng nhập
import { useState } from "react";
import { login } from "./authApi"; // đường dẫn tới authApi.js

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.username || !form.password) {
      setError("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    setLoading(true);
    try {
      const data = await login(form.username, form.password);
      console.log("Đăng nhập thành công:", data);
      alert("Đăng nhập thành công! Token: " + data?.data?.accessToken);
      // TODO: chuyển hướng về trang chính
      // navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Đăng nhập</h2>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>Username</label>
          <input
            style={styles.input}
            type="text"
            name="username"
            value={form.username}
            onChange={handleChange}
            placeholder="Nhập username"
          />

          <label style={styles.label}>Mật khẩu</label>
          <input
            style={styles.input}
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Nhập mật khẩu"
          />

          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>

          <p style={styles.link}>
            <a href="/forgot-password">Quên mật khẩu?</a>
          </p>
          <p style={styles.link}>
            Chưa có tài khoản? <a href="/register">Đăng ký ngay</a>
          </p>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f0f2f5",
  },
  card: {
    background: "#fff",
    padding: "2rem",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
    width: "100%",
    maxWidth: "420px",
  },
  title: { textAlign: "center", marginBottom: "1.5rem", color: "#1a1a2e" },
  form: { display: "flex", flexDirection: "column", gap: "0.75rem" },
  label: { fontWeight: "600", color: "#444", fontSize: "0.9rem" },
  input: {
    padding: "0.75rem 1rem",
    border: "1px solid #ddd",
    borderRadius: "8px",
    fontSize: "1rem",
    outline: "none",
  },
  button: {
    padding: "0.85rem",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "0.5rem",
  },
  error: {
    background: "#fee2e2",
    color: "#dc2626",
    padding: "0.75rem",
    borderRadius: "8px",
    marginBottom: "1rem",
    fontSize: "0.9rem",
  },
  link: { textAlign: "center", fontSize: "0.9rem", color: "#555" },
};
