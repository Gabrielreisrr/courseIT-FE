import { BrainCircuit } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  iconClassName?: string;
  textClassName?: string;
  showText?: boolean;
}

export function Logo({ 
  className, 
  iconClassName, 
  textClassName,
  showText = true 
}: LogoProps) {
  return (
    <Link 
      href="/" 
      className={cn("flex items-center gap-2", className)}
    >
      <BrainCircuit 
        className={cn("h-8 w-8 text-indigo-600", iconClassName)} 
      />
      {showText && (
        <span 
          className={cn(
            "text-xl font-bold text-foreground", 
            textClassName
          )}
        >
          course<span className="text-indigo-600">IT</span>
        </span>
      )}
    </Link>
  );
}