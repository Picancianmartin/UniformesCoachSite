const GlassCard = ({ children, className }) => {
  return (
    <div className={`rounded-2xl bg-white/10 border border-white/20 backdrop-blur-xl shadow-glass p-4 ${className}`}>
      {children}
    </div>
  )
}

export default GlassCard
