import React from "react";
import codeIcon from "../../assets/code-circle.svg";

export default function Footer({
  brandName = "COACH DAVID",
  portfolioUrl = "https://pietramartin.dev",
  creditName = "Pietra Martin",
  showCredit = true,
  className = "",
}) {
  const year = new Date().getFullYear();

  return (
    <footer
      className={`w-full border-t border-white/10 bg-navy/70 backdrop-blur-xl ${className}`}
    >
      <div className="max-w-[428px] mx-auto px-5 py-5">
        <div className="flex items-center justify-between gap-3">
          <small className="text-[11px] text-white/45 tracking-wide">
            © {year} {brandName}
          </small>

          {showCredit && (
            <a
              href={portfolioUrl}
              target="_blank"
              rel="nofollow noopener"
              className="flex items-center gap-2 text-[11px] tracking-wide text-slate-200/70 hover:text-slate-100/90 transition-colors"
              aria-label={`Site desenvolvido por ${creditName}`}
              title={`Desenvolvido por ${creditName}`}
            >
              <img
                src={codeIcon}
                alt=""
                aria-hidden="true"
                className="w-4 h-4 opacity-70"
              />

              <span className="border-b border-transparent hover:border-slate-200/30 transition-colors">
                {creditName}
              </span>
            </a>
          )}
        </div>
      </div>
    </footer>
  );
}
