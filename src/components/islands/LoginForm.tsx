import { useState } from 'preact/hooks';
import type { TargetedSubmitEvent } from 'preact';
import { login, getAccount } from '../../lib/api/auth';
import { setSession } from '../../lib/auth/session';

const GENERIC_ERROR = 'Usuario o contraseña incorrectos.';

const inputClass =
  'min-w-0 rounded-[3px] border border-night/25 bg-cream px-4 py-3 text-body text-night placeholder:text-night/40 transition-colors duration-300 focus:border-night/60 focus:outline-none';
const labelClass = 'text-[0.68rem] font-bold tracking-[0.14em] text-night/70 uppercase';

export default function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: TargetedSubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;

    setError(null);
    setLoading(true);
    try {
      const { id_token: token } = await login({ username, password, rememberMe });
      const user = await getAccount(token);
      setSession(token, user, rememberMe);
      window.location.href = '/mi-cuenta';
    } catch {
      // Never surface the backend's actual status/message — always the generic copy.
      setError(GENERIC_ERROR);
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      class="flex w-full max-w-md flex-col gap-5 rounded-card border border-night/10 bg-cream-deep/60 p-6 sm:p-8"
      noValidate
    >
      <div class="flex flex-col gap-1.5">
        <label for="username-field" class={labelClass}>
          Usuario
        </label>
        <input
          id="username-field"
          name="username"
          type="text"
          autocomplete="username"
          required
          value={username}
          onInput={(event) => setUsername((event.target as HTMLInputElement).value)}
          class={inputClass}
        />
      </div>

      <div class="flex flex-col gap-1.5">
        <label for="password-field" class={labelClass}>
          Contraseña
        </label>
        <input
          id="password-field"
          name="password"
          type="password"
          autocomplete="current-password"
          required
          value={password}
          onInput={(event) => setPassword((event.target as HTMLInputElement).value)}
          class={inputClass}
        />
      </div>

      <label class="flex items-center gap-2.5 text-[0.7rem] font-bold tracking-[0.08em] text-night/70 uppercase">
        <input
          type="checkbox"
          checked={rememberMe}
          onChange={(event) => setRememberMe((event.target as HTMLInputElement).checked)}
          class="h-4 w-4 rounded-[2px] border-night/40 text-gold-bright focus:ring-gold-bright"
        />
        Recordarme
      </label>

      {error && (
        <p role="alert" class="text-[0.75rem] font-bold text-magenta">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        class="mt-1 inline-flex items-center justify-center bg-gold-bright px-7 py-3.5 text-[0.7rem] font-bold tracking-[0.16em] text-night uppercase shadow-[0_10px_30px_-12px_rgba(0,0,0,0.6)] transition duration-300 ease-out hover:bg-white disabled:cursor-not-allowed disabled:bg-night/15 disabled:text-night/45 disabled:shadow-none"
      >
        {loading ? 'Ingresando…' : 'Ingresar'}
      </button>
    </form>
  );
}
