import { useState } from "react";
import { Link } from "react-router-dom";
import { Building2, Lock, Mail, Phone } from "lucide-react";
import { useAuthLang } from "./Authlayout.jsx";
import AuthInput from "./AuthInput.jsx";
import SubmitButton from "./SubmitButton.jsx";

/**
 * Pass `onSubmit({ name, phone, email, password })` (async) to connect your existing
 * registration logic. Without it the form validates and reports "not connected".
 */
export default function RegisterPage({ onSubmit }) {
  const { t: all } = useAuthLang();
  const t = all.register;
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.currentTarget));
    const next = {};
    if (!f.name?.trim()) next.name = t.required;
    if (!f.phone?.trim()) next.phone = t.required;
    if (!f.password) next.password = t.required;
    else if (f.password.length < 8) next.password = t.shortPassword;
    if (f.confirm !== f.password) next.confirm = t.mismatch;
    setErrors(next);
    setFormError("");
    if (Object.keys(next).length) return;
    if (!onSubmit) {
      setFormError(t.notConnected);
      return;
    }
    setLoading(true);
    try {
      await onSubmit({
        name: f.name,
        phone: f.phone,
        email: f.email,
        password: f.password,
      });
    } catch (err) {
      setFormError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  const pw = { showLabel: all.show, hideLabel: all.hide };

  return (
    <form onSubmit={handleSubmit} noValidate className="w-full">
      <h2 className="text-[21px] font-extrabold leading-tight tracking-[-0.01em] text-white sm:text-[24px]">
        {t.title}
      </h2>
      <p className="mt-1 text-[12px] leading-snug text-[#cfc5bd] sm:text-[12.5px]">
        {t.subtitle}
      </p>

      <div className="mt-3.5 space-y-2.5 sm:space-y-3">
        <AuthInput
          id="name"
          name="name"
          label={t.company}
          hint={t.companyHint}
          placeholder={t.companyPh}
          icon={Building2}
          autoComplete="organization"
          error={errors.name}
          autoFocus
        />
        <AuthInput
          id="phone"
          name="phone"
          type="tel"
          label={t.phone}
          hint={t.phoneHint}
          placeholder={t.phonePh}
          icon={Phone}
          autoComplete="tel"
          error={errors.phone}
        />
        <AuthInput
          id="email"
          name="email"
          type="email"
          label={t.email}
          optionalLabel={t.optional}
          hint={t.emailHint}
          placeholder={t.emailPh}
          icon={Mail}
          autoComplete="email"
        />

        <div className="grid grid-cols-1 gap-y-2.5 sm:grid-cols-2 sm:gap-x-3 sm:gap-y-0">
          <AuthInput
            id="password"
            name="password"
            type="password"
            label={t.password}
            hint={t.passwordHint}
            placeholder={t.passwordPh}
            icon={Lock}
            autoComplete="new-password"
            error={errors.password}
            {...pw}
          />
          <AuthInput
            id="confirm"
            name="confirm"
            type="password"
            label={t.confirm}
            reserveHint
            placeholder={t.confirmPh}
            icon={Lock}
            autoComplete="new-password"
            error={errors.confirm}
            {...pw}
          />
        </div>
      </div>

      {formError && (
        <p role="alert" className="mt-2 text-[11.5px] text-red-400">
          {formError}
        </p>
      )}

      <div className="mt-3.5 sm:mt-4">
        <SubmitButton loading={loading}>{t.submit}</SubmitButton>
      </div>

      <p className="mt-3 text-center text-[12px] leading-tight text-[#a89b92] sm:mt-4 sm:text-[12.5px]">
        {t.haveAccount}{" "}
        <Link to="/login" className="font-bold text-[#ee7a1f] hover:underline">
          {t.login}
        </Link>
      </p>
    </form>
  );
}
