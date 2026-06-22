import * as LucideIcons from 'lucide-react';

export function Icon({ name, size = 16, className, ...props }: { name: string; size?: number; className?: string; [key: string]: any }) {
  // Convert kebab-case to PascalCase for lucide-react (e.g. arrow-right -> ArrowRight)
  const iconName = name.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('');
  const LucideIcon = (LucideIcons as any)[iconName];
  if (!LucideIcon) return null;
  return <LucideIcon size={size} className={className} {...props} />;
}
