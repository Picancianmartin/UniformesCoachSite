const Checkout = () => {
  return (
    <div className="bg-navy text-white min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Pagamento</h1>
      <GlassCard>
        <h2 className="text-lg font-semibold mb-2">Pagar com PIX</h2>
        <img src="/pix-qr.png" alt="QR Code PIX" className="w-48 mx-auto" />
        <p className="text-center mt-2 text-sm">123.456.789-0000</p>
        <p className="text-center text-xs mt-1 text-secondary">Aguardando pagamento...</p>
      </GlassCard>
    </div>
  )
}
export default Checkout
