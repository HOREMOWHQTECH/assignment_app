export function Sk({ className = '', style }) {
  return <div className={`sk ${className}`} style={style} aria-hidden="true" />
}

export function DashboardSkeleton() {
  return (
    <>
      <div className="top">
        <Sk style={{ width: 130, height: 40, borderRadius: 999 }} />
        <Sk style={{ width: 130, height: 40, borderRadius: 999 }} />
        <div className="right">
          <Sk style={{ width: 100, height: 40, borderRadius: 999 }} />
          <Sk style={{ width: 40, height: 40, borderRadius: '50%' }} />
          <Sk style={{ width: 150, height: 40, borderRadius: 999 }} />
        </div>
      </div>
      <div className="grid">
        <section className="card hero">
          <Sk style={{ width: 220, height: 26, borderRadius: 999 }} />
          <Sk className="sk-title" />
          <Sk className="sk-line" style={{ width: '70%' }} />
          <Sk className="sk-line" style={{ width: '45%' }} />
          <div style={{ display: 'flex', gap: 28, marginTop: 14, paddingTop: 20, borderTop: '1px solid var(--line)' }}>
            <Sk className="sk-line" style={{ width: 90 }} />
            <Sk className="sk-line" style={{ width: 110 }} />
            <Sk className="sk-line" style={{ width: 130 }} />
          </div>
        </section>
        <section className="card goal">
          <Sk className="sk-line" style={{ width: 90, alignSelf: 'flex-start' }} />
          <Sk className="sk-ring" />
          <Sk style={{ width: 110, height: 28, borderRadius: 999 }} />
          <Sk className="sk-line" style={{ width: '80%' }} />
        </section>
      </div>
      <section className="card log">
        <Sk className="sk-line" style={{ width: 160 }} />
        <div className="tiles">
          {[0, 1, 2, 3].map((i) => (
            <Sk key={i} style={{ height: 76, borderRadius: 18 }} />
          ))}
        </div>
      </section>
    </>
  )
}
