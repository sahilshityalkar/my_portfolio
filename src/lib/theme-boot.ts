/**
 * Theme values shared by the server layout (the inline boot script, the
 * theme-color) and the client (setTheme). Kept out of the "use client"
 * module so the server imports plain values.
 */
export const THEME_KEY = "theme";
const KEY = THEME_KEY;

/** The paper of each theme: the browser chrome (theme-color) follows the page. */
export const PAPER = { day: "#f5f2ec", night: "#11100f" } as const;

/**
 * Inline, render-blocking script: applies the saved theme before first
 * paint, with its theme-color (first in <head>, so it wins over the default).
 * It also arms a failsafe: `.js` hides not-yet-revealed sections until the
 * reveal observer shows them. If the app's script never runs (a failed chunk,
 * a blocking extension), they would stay hidden, so after 4s without the
 * observer the gate is lifted and the page reads as it does without JS.
 */
export const themeBootScript = `(function(){try{var d=document.documentElement;d.classList.add('js');setTimeout(function(){if(!d.dataset.revealReady)d.classList.remove('js')},4000);var t=localStorage.getItem('${KEY}');if(t==='night'||t==='day'){d.dataset.theme=t;var m=document.createElement('meta');m.name='theme-color';m.id='theme-color';m.content=t==='night'?'${PAPER.night}':'${PAPER.day}';document.head.prepend(m)}}catch(e){}if(location.pathname==='/'&&matchMedia('(min-width: 1024px)').matches){d.classList.add('ruler')}})();`;
