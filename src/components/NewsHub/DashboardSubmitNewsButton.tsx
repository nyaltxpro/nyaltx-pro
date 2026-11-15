import Link from 'next/link';

export default function DashboardSubmitNewsButton() {
  return (
    <Link
      href="/newshub/submit?modal=open&plan=feed"
      className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-cyan-400 to-indigo-500 hover:from-cyan-300 hover:to-indigo-400 text-slate-950 font-bold rounded-md shadow-md transition-all transform hover:scale-105"
    >
      <span>Submit News</span>
      <span aria-hidden="true">→</span>
    </Link>
  );
}
