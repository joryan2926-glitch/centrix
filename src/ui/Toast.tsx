type ToastProps = {
  title: string;
  detail: string;
};

export function Toast({ title, detail }: ToastProps) {
  return (
    <div className="fixed right-4 top-20 z-50 w-[calc(100%-2rem)] max-w-sm rounded-[8px] border border-cyan-200/20 bg-slate-950/90 p-4 text-sm shadow-halo backdrop-blur-2xl animate-fade-in">
      <p className="font-semibold text-white">{title}</p>
      <p className="mt-1 text-slate-400">{detail}</p>
    </div>
  );
}
