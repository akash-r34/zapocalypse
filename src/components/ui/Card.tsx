interface CardProps {
  children: React.ReactNode;
  className?: string;
  elevated?: boolean;
  style?: React.CSSProperties;
}

export function Card({ children, className = "", elevated = false, style }: CardProps) {
  return (
    <div
      className={`rounded-2xl p-6 ${elevated ? "glass-elevated" : "glass"} ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}
