import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface OnlineStatusProps {
  isOnline: boolean;
  lastOnlineAt: string | null;
  variant?: "badge" | "dot" | "text";
}

export function OnlineStatus({ isOnline, lastOnlineAt, variant = "dot" }: OnlineStatusProps) {
  const getLastSeenText = () => {
    if (!lastOnlineAt) return null;
    
    try {
      const date = new Date(lastOnlineAt);
      return `Visto ${formatDistanceToNow(date, { addSuffix: true, locale: es })}`;
    } catch {
      return null;
    }
  };

  if (isOnline) {
    if (variant === "badge") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          En línea
        </span>
      );
    }

    if (variant === "text") {
      return (
        <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          En línea
        </span>
      );
    }

    // variant === "dot"
    return (
      <div 
        className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-card animate-pulse" 
        title="En línea" 
      />
    );
  }

  // Offline state
  const lastSeenText = getLastSeenText();

  if (variant === "badge" && lastSeenText) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />
        {lastSeenText}
      </span>
    );
  }

  if (variant === "text" && lastSeenText) {
    return (
      <span className="text-xs text-muted-foreground">
        {lastSeenText}
      </span>
    );
  }

  // For dot variant when offline, return null or a gray dot
  if (variant === "dot" && lastSeenText) {
    return (
      <div 
        className="w-3 h-3 rounded-full bg-muted-foreground/30 border-2 border-card" 
        title={lastSeenText} 
      />
    );
  }

  return null;
}
