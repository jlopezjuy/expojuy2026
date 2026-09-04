import { useEffect, useRef, useState } from 'preact/hooks';
import { getAccount } from '../../lib/api/auth';
import { sessionSignal, setSession, clearSession, type Session } from '../../lib/auth/session';

/**
 * Inclinación de la credencial siguiendo el puntero. Sólo con puntero fino: en
 * touch no hay hover que la dispare, y el giroscopio queda deliberadamente
 * afuera — pedir permiso de sensores para un efecto decorativo no se justifica.
 */
function useCardTilt<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const card = ref.current;
    if (!card) return;
    if (!window.matchMedia('(pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const MAX_DEG = 6;

    const onMove = (event: PointerEvent) => {
      const box = card.getBoundingClientRect();
      if (!box.width || !box.height) return;
      const px = (event.clientX - box.left) / box.width - 0.5;
      const py = (event.clientY - box.top) / box.height - 0.5;
      card.style.transform = `perspective(900px) rotateX(${(-py * MAX_DEG).toFixed(2)}deg) rotateY(${(px * MAX_DEG).toFixed(2)}deg)`;
    };

    const reset = () => {
      card.style.transform = '';
    };

    card.addEventListener('pointermove', onMove);
    card.addEventListener('pointerleave', reset);
    // Un scroll o un cambio de foco pueden dejar la tarjeta torcida sin puntero encima.
    window.addEventListener('blur', reset);

    return () => {
      card.removeEventListener('pointermove', onMove);
      card.removeEventListener('pointerleave', reset);
      window.removeEventListener('blur', reset);
      reset();
    };
  }, []);

  return ref;
}

export default function AccountView() {
  const [session, setLocalSession] = useState<Session | null>(sessionSignal.value);
  const [refreshFailed, setRefreshFailed] = useState(false);
  const cardRef = useCardTilt<HTMLDivElement>();

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
    <div
      ref={cardRef}
      class="flex w-full max-w-md flex-col gap-6 rounded-card border border-night/10 bg-cream-deep/60 p-6 shadow-[0_18px_45px_-30px_rgba(4,12,20,0.7)] transition-transform duration-300 ease-out will-change-transform sm:p-8"
    >
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
