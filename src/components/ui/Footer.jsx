// src/components/ui/Footer.jsx
export default function Footer({
  brandName = "Sua Marca",
  portfolioUrl = "https://seusite.com/cases/nome-do-projeto",
  creditName = "Seu Nome",
  showCredit = true,
  className = "",
}) {
  const year = new Date().getFullYear();

  return (
    <footer className={`w-full border-t border-white/10 ${className}`}>
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <small className="text-xs text-white/50">
            © {year} {brandName}. Todos os direitos reservados.
          </small>

          {showCredit && (
            <small className="text-xs text-white/45">
              <span className="mr-1">by</span>
              <a
                href={portfolioUrl}
                target="_blank"
                rel="nofollow noopener"
                className="text-white/55 hover:text-white/80 transition-colors"
                aria-label={`Créditos do site — ${creditName}`}
              >
                {creditName}
              </a>
            </small>
          )}
        </div>
      </div>
    </footer>
  );
}
