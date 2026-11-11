import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, Mail } from "lucide-react";
import { useAuthLang } from "./Authlayout.jsx";
import AuthInput from "./AuthInput.jsx";
import SubmitButton from "./SubmitButton.jsx";
import { loginUser } from "../../Services/authService.js";

export default function Login() {
  const { t: all } = useAuthLang();
  const t = all.login;

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    const f = new FormData(e.currentTarget);

    const values = {
      email: f.get("email"),
      password: f.get("password"),
      remember: f.get("remember") === "on",
    };

    setError("");
    setLoading(true);

    try {
      await loginUser(values);

      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <h2 className="text-[26px] font-extrabold leading-8 tracking-[-0.01em] text-white">
        {t.title}
      </h2>

      <p className="mt-[10px] text-[13px] leading-[18px] text-[#cfc5bd]">
        {t.subtitle}
      </p>

      <div className="mt-6 space-y-[18px]">
        <AuthInput
          id="email"
          name="email"
          type="email"
          label={t.email}
          placeholder={t.emailPh}
          icon={Mail}
          autoComplete="email"
        />

        <AuthInput
          id="password"
          name="password"
          type="password"
          label={t.password}
          placeholder={t.passwordPh}
          icon={Lock}
          autoComplete="current-password"
          showLabel={all.show}
          hideLabel={all.hide}
        />
      </div>

      <label className="mt-[19px] flex w-fit cursor-pointer items-center gap-[9px] text-[12px] text-[#d9d0c8]">
        <input
          type="checkbox"
          name="remember"
          className="h-[13px] w-[13px] cursor-pointer rounded-[3px] accent-[#ea6a1a]"
        />
        {t.keep}
      </label>

      {error && (
        <p role="alert" className="mt-3 text-[12px] text-red-400">
          {error}
        </p>
      )}

      <div className="mt-[19px]">
        <SubmitButton loading={loading}>{t.submit}</SubmitButton>
      </div>

      <p className="mt-5 text-center text-[13px] leading-[18px] text-[#a89b92]">
        {t.noAccount}{" "}
        <Link
          to="/register"
          className="font-bold text-[#ee7a1f] hover:underline"
        >
          {t.register}
        </Link>
      </p>
    </form>
  );
}
