import { useEffect, useState } from 'preact/hooks';
import { getAccount } from '../../lib/api/auth';
import { sessionSignal, setSession, clearSession, type Session } from '../../lib/auth/session';

export default function AccountView() {
  const [session, setLocalSession] = useState<Session | null>(sessionSignal.value);
  const [refreshFailed, setRefreshFailed] = useState(false);

  useEffect(() => {
    const current = sessionSignal.value;
    if (!current) {
      window.location.href = '/login';
      return;
    }

    getAccount(current.token)
      .then((freshUser) => {
        setSession(current.token, freshUser, current.remember);
        setLocalSession(sessionSignal.value);
        setRefreshFailed(false);
      })
      .catch(() => {
        // A 401 already triggers global logout + redirect via the unauthorized
        // handler (see client.ts / session.ts). Any other failure (offline,
        // backend down) just keeps showing the cached data below.
        setRefreshFailed(true);
      });
  }, []);

  function handleLogout() {
    clearSession();
    window.location.href = '/';
  }

  if (!session) {
    return <p class="text-body text-night/60">Redirigiendo…</p>;
  }

  const { user } = session;
  const fields = [
    { label: 'Nombre', value: `${user.firstName} ${user.lastName}`.trim() },
    { label: 'Usuario', value: user.login },
    { label: 'Email', value: user.email },
  ];

  return (
    <div class="flex w-full max-w-md flex-col gap-6 rounded-card border border-night/10 bg-cream-deep/60 p-6 sm:p-8">
      <dl class="flex flex-col gap-5">
        {fields.map((field) => (
          <div key={field.label}>
            <dt class="text-[0.68rem] font-bold tracking-[0.14em] text-night/60 uppercase">
              {field.label}
            </dt>
            <dd class="mt-1 font-display text-title text-night">{field.value}</dd>
          </div>
        ))}
      </dl>

      {refreshFailed && (
        <p class="text-[0.7rem] text-night/50">No pudimos actualizar tus datos. Mostrando la última versión guardada.</p>
      )}

      <button
        type="button"
        onClick={handleLogout}
        class="inline-flex items-center justify-center border border-night/30 px-7 py-3.5 text-[0.7rem] font-bold tracking-[0.16em] text-night uppercase transition duration-300 ease-out hover:border-night hover:bg-night hover:text-cream"
      >
        Cerrar sesión
      </button>
    </div>
  );
}
