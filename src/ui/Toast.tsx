type ToastProps = {
  title: string;
  detail: string;
};

export function Toast({ title, detail }: ToastProps) {
  return (
    <div className="fixed right-4 top-20 z-50 w-[calc(100%-2rem)] max-w-sm rounded-[14px] border border-slate-200 bg-white p-4 text-sm shadow-[0_20px_52px_rgba(15,23,42,0.18)] animate-fade-in">
      <div className="absolute inset-y-3 left-0 w-1 rounded-r-full bg-blue-600" />
      <p className="font-extrabold text-slate-950">{title}</p>
      <p className="mt-1 font-medium text-slate-500">{detail}</p>
    </div>
  );
}
