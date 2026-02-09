const Chip = ({ label, active }) => (
  <div className={`px-3 py-1 rounded-full text-sm ${active ? 'bg-primary text-white' : 'bg-white/10 text-white/70'}`}>
    {label}
  </div>
)
export default Chip