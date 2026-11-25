import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import AppShell from '../components/AppShell.jsx'
import Icon from '../components/Icon.jsx'
import { AUDIENCES } from '../data/messages.js'
import { useBibleProgress, useBibleBooks, bibleStats } from '../api/bibleStudy.js'
import { useBookProgress, useAllBooks, bookStats } from '../api/books.js'
import { useMessages } from '../api/messages.js'
import { useBenchmarks, useSoulTargets, usePrayerTargets } from '../api/admin.js'
import { useSouls } from '../api/souls.js'
import { usePrayerSessions } from '../api/prayer.js'

const LABEL = Object.fromEntries(AUDIENCES.map((a) => [a.key, a.label]))
const DAYS = 365

const pct = (part, total) => (total > 0 ? Math.min(100, Math.round((part / total) * 100)) : 0)

function grade(p) {
  if (p >= 90) return 'Excellent'
  if (p >= 75) return 'Great'
  if (p >= 50) return 'Good'
  if (p >= 25) return 'Fair'
  return 'Keep going'
}

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
  const { progress: bibleProgress } = useBibleProgress()
  const bibleBooks = useBibleBooks()
  const { progress: bookProgress } = useBookProgress()
  const books = useAllBooks()
  const { entries: messages } = useMessages()
  const { benchmarks } = useBenchmarks()
  const { souls } = useSouls()
  const { targets: soulTargets } = useSoulTargets()
  const { sessions } = usePrayerSessions()
  const { targets: prayerTargets } = usePrayerTargets()
  const [copied, setCopied] = useState(false)

  const data = useMemo(() => {
    const bible = bibleStats(bibleProgress, bibleBooks)
    const totalChapters = bibleBooks.reduce((n, b) => n + b.chapters, 0)
    const biblePct = pct(bible.done, totalChapters)

    const bs = bookStats(bookProgress, books)
    const totalPages = books.reduce((n, b) => n + b.pageCount, 0)
    const booksPct = pct(bs.pagesRead, totalPages)

    let msgLogged = 0
    let msgTarget = 0
    const msgRows = AUDIENCES.map((a) => {
      const logged = messages.filter((m) => (m.audiences || (m.audience ? [m.audience] : [])).includes(a.key)).length
      const target = benchmarks[a.key] || 0
      msgLogged += logged
      msgTarget += target
      return { label: a.label, logged, target, p: pct(logged, target) }
    })
    const messagesPct = pct(msgLogged, msgTarget)

    let soulLogged = 0
    let soulTarget = 0
    const soulRows = AUDIENCES.map((a) => {
      const logged = souls.filter((s) => (s.events || []).includes(a.key)).length
      const target = soulTargets[a.key] || 0
      soulLogged += logged
      soulTarget += target
      return { label: a.label, logged, target, p: pct(logged, target) }
    })
    const soulsPct = pct(soulLogged, soulTarget)

    let prayLogged = 0
    let prayTarget = 0
    const prayRows = AUDIENCES.map((a) => {
      const minutes = sessions.filter((s) => (s.events || []).includes(a.key)).reduce((n, s) => n + s.minutes, 0)
      const target = (prayerTargets[a.key] || 0) * DAYS
      prayLogged += minutes
      prayTarget += target
      return { label: a.label, logged: minutes, target, p: pct(minutes, target) }
    })
    const prayerPct = pct(prayLogged, prayTarget)

    const categories = [
      { name: 'Bible Study', detail: `${bible.done}/${totalChapters} chapters · ${bible.booksComplete}/${bibleBooks.length} books`, pct: biblePct },
      { name: 'Books', detail: `${bs.pagesRead}/${totalPages} pages · ${bs.completed}/${books.length} completed`, pct: booksPct },
      { name: 'Messages', detail: `${msgLogged}/${msgTarget} logged`, pct: messagesPct, rows: msgRows },
      { name: 'Soul Winning', detail: `${soulLogged}/${soulTarget} souls`, pct: soulsPct, rows: soulRows },
      { name: 'Prayer & Fasting', detail: `${Math.round(prayLogged / 60)}h / ${Math.round(prayTarget / 60)}h prayed`, pct: prayerPct, rows: prayRows },
    ]
    const overall = Math.round(categories.reduce((n, c) => n + c.pct, 0) / categories.length)
    return { categories, overall, grade: grade(overall), date: new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) }
  }, [bibleProgress, bibleBooks, bookProgress, books, messages, benchmarks, souls, soulTargets, sessions, prayerTargets])

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
