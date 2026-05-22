import type { ReactNode, ThHTMLAttributes, TdHTMLAttributes, HTMLAttributes } from "react";

function Table({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className="w-full overflow-x-auto">
      <table className={`w-full text-sm ${className}`}>{children}</table>
    </div>
  );
}

function TableHeader({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <thead className={`border-b border-border ${className}`}>{children}</thead>;
}

function TableBody({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <tbody className={`divide-y divide-border ${className}`}>{children}</tbody>;
}

function TableRow({ children, className = "", ...props }: HTMLAttributes<HTMLTableRowElement> & { children: ReactNode }) {
  return (
    <tr className={`transition-colors hover:bg-surface-hover ${className}`} {...props}>
      {children}
    </tr>
  );
}

function TableHead({ children, className = "", scope = "col", ...props }: ThHTMLAttributes<HTMLTableCellElement> & { children?: ReactNode }) {
  return (
    <th
      scope={scope}
      className={`px-4 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider ${className}`}
      {...props}
    >
      {children}
    </th>
  );
}

function TableCell({ children, className = "", ...props }: TdHTMLAttributes<HTMLTableCellElement> & { children?: ReactNode }) {
  return (
    <td className={`px-4 py-3 text-foreground ${className}`} {...props}>
      {children}
    </td>
  );
}

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell };
