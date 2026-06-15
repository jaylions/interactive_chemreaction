export default function AIAssistantPanel({
  title = 'AI 조수',
  status = '대기 중',
  summary,
  detail,
  missionTitle,
  tone = 'sky',
}) {
  const colors = {
    sky: {
      section: 'border-sky-200 bg-sky-50',
      label: 'text-sky-700',
      dot: 'bg-sky-400',
      badge: 'text-sky-600 border-sky-100',
    },
    emerald: {
      section: 'border-emerald-200 bg-emerald-50',
      label: 'text-emerald-700',
      dot: 'bg-emerald-400',
      badge: 'text-emerald-600 border-emerald-100',
    },
    amber: {
      section: 'border-amber-200 bg-amber-50',
      label: 'text-amber-700',
      dot: 'bg-amber-400',
      badge: 'text-amber-600 border-amber-100',
    },
  };
  const c = colors[tone] || colors.sky;

  return (
    <section className={`mx-auto w-full max-w-5xl rounded-2xl border-2 ${c.section} px-5 py-4 shadow-sm`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="relative mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white border border-white/80 shadow-sm">
            <div className={`h-5 w-5 rounded-full ${c.dot} animate-pulse`} />
            <div className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-emerald-400 border-2 border-white" />
          </div>
          <div>
            <div className={`text-sm font-bold ${c.label}`}>{title} · {status}</div>
            <p className="mt-1 text-lg font-semibold text-slate-800">{summary}</p>
            {detail && <p className="mt-1 text-base text-slate-600">{detail}</p>}
          </div>
        </div>
        {missionTitle && (
          <div className={`shrink-0 rounded-xl bg-white px-3 py-2 text-right text-xs font-semibold text-slate-500 border ${c.badge}`}>
            <div>{missionTitle}</div>
            <div className={c.badge.split(' ')[0]}>학생용 힌트</div>
          </div>
        )}
      </div>
    </section>
  );
}
