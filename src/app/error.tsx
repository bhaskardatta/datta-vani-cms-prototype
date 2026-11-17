'use client';
// Last line of defence for saved data. The store already replaces data it cannot read; this catches data that looks
// right but still breaks a screen (for example an item saved by an older build without its chapters).
import { useEffect } from 'react';
import { Button, Empty } from '@/components/ui';
import { STORAGE_KEY } from '@/lib/store';

export default function AppError({ error }: { error: unknown; retry: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  const reset = () => {
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* storage blocked: nothing saved to remove */ }
    // A full reload, because the store keeps the broken state in memory. Fresh data is signed out, so it lands on sign-in.
    window.location.reload();
  };
  return (
    <main className="min-h-screen bg-bg px-4">
      <Empty title="This screen could not open" icon="alert" action={<Button variant="primary" icon="reset" onClick={reset}>Reset demo data</Button>}>
        The sample data saved in this browser does not match this version of the prototype. Resetting it puts back the
        starting data; it only affects this browser.
      </Empty>
    </main>
  );
}
