export function LoadingState({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="rounded-xl border bg-card p-5 text-sm text-muted-foreground">
      {label}
    </div>
  );
}

