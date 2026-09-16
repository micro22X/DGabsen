import { cn } from "@/lib/utils";

export default function GlassCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl overflow-hidden", className)}>
      {children}
    </div>
  );
}
