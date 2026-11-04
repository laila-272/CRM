import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";

import AnimatedBackground from "../../assets/background.png";
import LanguageSelector from "./LanguageSelector.jsx";
import LeftSection from "./LeftSection.jsx";
import StrongLogo from "./StrongLogo.jsx";
import { authTranslations } from "./Authtranslations.js";

const AuthLangContext = createContext({
  lang: "en",
  t: authTranslations.en,
});

export const useAuthLang = () => useContext(AuthLangContext);

export default function AuthenticationLayout() {
  const { pathname } = useLocation();

  const [lang, setLang] = useState(() => {
    try {
      return localStorage.getItem("auth-lang") || "en";
    } catch {
      return "en";
    }
  });

  const t = authTranslations[lang] || authTranslations.en;
  const isRegister = pathname.startsWith("/register");

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = t.dir || (lang === "ar" ? "rtl" : "ltr");

    try {
      localStorage.setItem("auth-lang", lang);
    } catch {
      // Storage may be unavailable in private browsing.
    }
  }, [lang, t.dir]);

  useEffect(() => {
    document.title = isRegister
      ? "Register | Strong CRM"
      : "Log in | Strong CRM";
  }, [isRegister]);

  const ctx = useMemo(() => ({ lang, t }), [lang, t]);

  return (
    <AuthLangContext.Provider value={ctx}>
      <div className="relative h-[100dvh] w-screen overflow-hidden bg-ink text-white flex flex-col">
        {/* Background */}
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${AnimatedBackground})` }}
        />

        {/* Top Bar Navigation for Mobile & Desktop */}
        <header className="relative z-20 flex w-full items-center justify-between px-4 pt-3 sm:px-6 sm:pt-4 lg:px-[max(32px,calc((100vw-1240px)/2))]">
          <LanguageSelector lang={lang} onChange={setLang} t={t} />
          <StrongLogo />
          {/* Language Selector Desktop + Mobile in Top Header */}
        </header>

        <main
          dir="ltr"
          className="
            relative z-10 mx-auto grid flex-1 w-full max-w-[1240px]
            grid-cols-1 items-center gap-y-3
            px-4 pb-4 pt-2
            sm:px-6 sm:pb-6
            md:max-w-[760px]
            lg:max-w-[1240px]
            lg:grid-cols-[minmax(0,0.88fr)_minmax(420px,1fr)]
            lg:gap-x-[clamp(24px,3vw,56px)]
            lg:px-8 lg:py-2
            min-[1280px]:px-0
          "
        >
          {/* Mobile intro header block (Headline only) */}
          <section className="w-full min-w-0 lg:hidden text-center sm:text-start">
            <h1 className="text-[20px] font-extrabold leading-tight text-white sm:text-[24px]">
              {t.headline1}{" "}
              <span className="text-[#e4631a]">{t.headline2}</span>
            </h1>
          </section>

          {/* Full desktop marketing section */}
          <section className="hidden min-w-0 lg:flex lg:items-center">
            <div className="w-full">
              <LeftSection t={t} variant={isRegister ? "register" : "login"} />
            </div>
          </section>

          {/* Form wrapper */}
          <section className="flex w-full min-w-0 items-center justify-center">
            <div className="relative w-full max-w-[480px]">
              <div
                key={pathname}
                dir={t.dir || (lang === "ar" ? "rtl" : "ltr")}
                className="
                  animate-card-in w-full rounded-[14px]
                  border border-white/[0.07] bg-[#120907]/95
                  px-4 py-4
                  shadow-[0_20px_60px_rgba(0,0,0,.55)]
                  backdrop-blur-[2px]
                  sm:px-6 sm:py-6
                  lg:px-[clamp(22px,2.2vw,32px)]
                  lg:py-[clamp(18px,2.6vh,32px)]
                "
              >
                <Outlet />
              </div>
            </div>
          </section>
        </main>
      </div>
    </AuthLangContext.Provider>
  );
}
