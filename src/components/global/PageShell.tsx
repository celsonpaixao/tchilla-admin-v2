import { cn } from "@/lib/utils";

interface PageShellProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  /** Limita largura para páginas de formulário/configuração */
  narrow?: boolean;
  className?: string;
}

export function PageShell({
  title, subtitle, actions, children, narrow, className,
}: PageShellProps) {
  return (
    <div className={cn("space-y-5 animate-fade-in", narrow && "max-w-2xl", className)}>
      {/* Cabeçalho responsivo — empilha em mobile, linha em desktop */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          <h1 style={{
            fontFamily:  "var(--display)",
            fontSize:    20,
            fontWeight:  700,
            color:       "var(--heading)",
            lineHeight:  1.2,
            margin:      0,
          }}>
            {title}
          </h1>
          {subtitle && (
            <p style={{
              fontSize:   "var(--font-sm)",
              color:      "var(--text-3)",
              marginTop:  3,
            }}>
              {subtitle}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
            {actions}
          </div>
        )}
      </div>

      {children}
    </div>
  );
}
