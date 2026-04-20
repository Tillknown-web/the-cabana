export default function GoldDivider({ my = '2rem' }: { my?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', margin: `${my} 0` }}>
      <div
        style={{
          width: '40px',
          height: '1px',
          backgroundColor: '#D4AF37',
          opacity: 0.5,
        }}
      />
    </div>
  )
}
