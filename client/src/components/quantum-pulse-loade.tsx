import { cn } from "@/lib/utils";

interface QuantumPulseLoaderProps {
  text?: string;
  className?: string;
}

export function QuantumPulseLoader({ 
  text = "Analyzing", 
  className 
}: QuantumPulseLoaderProps) {
  const letters = text.split('');
  
  return (
    <div className={cn("generating-loader-wrapper", className)}>
      <div className="generating-loader-text">
        {letters.map((letter, index) => (
          <span key={index} className="generating-loader-letter">
            {letter}
          </span>
        ))}
      </div>
      <div className="generating-loader-bar"></div>
    </div>
  );
}

export default QuantumPulseLoader;
