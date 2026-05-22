interface GoldDividerProps {
  className?: string;
}

function GoldDivider({ className = "" }: GoldDividerProps) {
  return <div className={`gold-divider w-full my-8 ${className}`} role="separator" />;
}

export { GoldDivider };
