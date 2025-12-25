interface LoadingSpinnerProps {
  message?: string;
}

export default function LoadingSpinner({
  message = "Loading...",
}: LoadingSpinnerProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="spinner mb-4" />
      <p className="text-zinc-400">{message}</p>
    </div>
  );
}
