import { sessionSignal, clearSession } from '../../lib/auth/session';

interface Props {
  /** Matches the two nav lists in Header.astro: the desktop `<ul>` and the mobile panel `<ul>`. */
  variant: 'desktop' | 'mobile';
}

const desktopLink =
  'relative block py-2 text-[0.62rem] font-bold tracking-[0.1em] whitespace-nowrap text-white/85 uppercase transition-colors duration-300 hover:text-white after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-gold-bright after:transition-transform after:duration-300 after:content-[\'\'] hover:after:scale-x-100 min-[1680px]:text-[0.68rem] min-[1680px]:tracking-[0.16em]';
const desktopButton = `${desktopLink} cursor-pointer bg-transparent`;

const mobileLink = 'block border-b border-white/10 py-4 text-sm font-bold tracking-[0.16em] text-white uppercase';
const mobileButton = `${mobileLink} w-full cursor-pointer bg-transparent text-left`;

export default function AuthNav({ variant }: Props) {
  const session = sessionSignal.value;
  const linkClass = variant === 'desktop' ? desktopLink : mobileLink;
  const buttonClass = variant === 'desktop' ? desktopButton : mobileButton;

  function handleLogout() {
    clearSession();
    window.location.href = '/';
  }

  if (!session) {
    return (
      <a href="/login" class={linkClass}>
        Iniciar sesión
      </a>
    );
  }

  return (
    <div class={variant === 'desktop' ? 'flex items-center gap-3' : 'flex flex-col'}>
      <a href="/mi-cuenta" class={linkClass}>
        Mi cuenta
      </a>
      <button type="button" onClick={handleLogout} class={buttonClass}>
        Cerrar sesión
      </button>
    </div>
  );
}
