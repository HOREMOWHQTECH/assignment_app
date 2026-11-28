import { useState } from 'react'
import { motion } from 'framer-motion'
import AppShell from '../components/AppShell.jsx'
import Icon from '../components/Icon.jsx'
import { useReportSummary } from '../api/reports.js'

function buildReportHTML(data) {
  const rows = data.categories.map((c) => `
    <tr>
      <td>${c.name}</td>
      <td>${c.detail}</td>
      <td class="num">${c.pct}%</td>
      <td><div class="bar"><i style="width:${c.pct}%"></i></div></td>
    </tr>`).join('')
  return `<!doctype html><html><head><meta charset="utf-8"><title>HOREMOW Progress Report</title>
<style>
  body{font-family:Manrope,Arial,sans-serif;background:#f4f7f5;margin:0;padding:32px;color:#14201a}
  .sheet{max-width:720px;margin:0 auto;background:#fff;border:1px solid #e0e7e3;border-radius:20px;padding:40px}
  h1{margin:0;font-size:26px} .sub{color:#5f7268;font-size:13px;margin-top:4px}
  .overall{display:flex;align-items:center;gap:24px;margin:24px 0;padding:20px;background:#e0f2ed;border-radius:16px}
  .overall b{font-size:40px;color:#059669} table{width:100%;border-collapse:collapse;margin-top:8px}
  td{padding:12px 8px;border-bottom:1px solid #edf2ef;font-size:14px} td.num{font-weight:800;text-align:right;white-space:nowrap}
  .bar{height:8px;background:#e2e8e4;border-radius:99px;overflow:hidden;min-width:120px}
  .bar i{display:block;height:100%;background:#059669;border-radius:99px}
  .foot{margin-top:24px;font-size:12px;color:#5f7268;text-align:center}
</style></head><body><div class="sheet">
<h1>HOREMOW Progress Report</h1>
<p class="sub">Generated ${data.date} · Overall score: <b>${data.overall}%</b> (${data.grade})</p>
<div class="overall"><b>${data.overall}%</b><div>Overall completion across all assignments</div></div>
<table><tbody>${rows}</tbody></table>
<p class="foot">HOREMOW Assignment Tracker — confidential personal report</p>
</div></body></html>`
}

export default function Reports() {
  const { data, isLoading, error } = useReportSummary()
  const [copied, setCopied] = useState(false)

  if (isLoading || !data) {
    return <AppShell><main style={{ padding: 40 }}><p className="sub">Loading report…</p></main></AppShell>
  }
  if (error) {
    return <AppShell><main style={{ padding: 40 }}><p className="form-error">{error.message}</p></main></AppShell>
  }

  const download = () => {
    const html = buildReportHTML(data)
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `horemow-report-${new Date().toISOString().slice(0, 10)}.html`
    a.click()
    URL.revokeObjectURL(url)
  }

  const share = async () => {
    const text = `My HOREMOW progress: ${data.overall}% overall (${data.grade}) — ${data.categories.map((c) => `${c.name}: ${c.pct}%`).join(', ')}`
    if (navigator.share) {
      try { await navigator.share({ title: 'HOREMOW Progress Report', text }) } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <AppShell>
      <main>
        <div className="bs-head">
          <div>
            <h1>Progress Report</h1>
            <p className="sub">Your combined score across every assignment — download or share your report sheet.</p>
          </div>
          <div className="bs-stats">
            <button className="btn pri" type="button" onClick={download}><Icon name="plus" /> Download report</button>
            <button className="btn out" type="button" onClick={share}><Icon name="check" /> {copied ? 'Copied!' : 'Share'}</button>
          </div>
        </div>

        <motion.div className="report-sheet" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="report-head">
            <div className="logo" />
            <div>
              <h2>HOREMOW Progress Report</h2>
              <span>{data.date}</span>
            </div>
            <div className="report-overall">
              <strong>{data.overall}%</strong>
              <span>{data.grade}</span>
            </div>
          </div>

          {data.categories.map((c, i) => (
            <div className="report-cat" key={c.name}>
              <div className="report-cat-top">
                <strong>{c.name}</strong>
                <span className="report-pct">{c.pct}%</span>
              </div>
              <div className="book-bar"><i style={{ width: `${c.pct}%` }} /></div>
              <span className="bench-hint">{c.detail}</span>
              {c.rows && (
                <div className="report-rows">
                  {c.rows.map((r) => (
                    <div className="report-row" key={r.label}>
                      <span>{r.label}</span>
                      <span className="report-row-val">{r.logged}/{r.target} · {r.p}%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          <p className="report-foot">Generated by HOREMOW Assignment Tracker · {data.date}</p>
        </motion.div>
      </main>
    </AppShell>
  )
}
