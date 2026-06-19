
export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  ...props 
}) {
  const baseStyles = "inline-flex items-center justify-center rounded-full font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-zinc-950 disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    primary: "bg-emerald-500 text-zinc-950 hover:bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)]",
    secondary: "bg-zinc-800 text-zinc-100 hover:bg-zinc-700 shadow-lg hover:shadow-zinc-700/30",
    outline: "border border-zinc-700 text-zinc-100 hover:bg-zinc-800",
    ghost: "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
  };

  const sizes = {
    sm: "h-9 px-4 text-sm",
    md: "h-11 px-6 py-2",
    lg: "h-14 px-8 text-lg"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}