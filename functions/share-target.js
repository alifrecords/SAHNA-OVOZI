// Ulashish (Android) — service worker hali o'rnatilmagan bo'lsa POST shu yerga keladi: pultga qaytaramiz
export const onRequestPost = ({ request }) => Response.redirect(new URL('/?share=nosw', request.url).toString(), 303);
export const onRequestGet = ({ request }) => Response.redirect(new URL('/', request.url).toString(), 302);
