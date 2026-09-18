// Temporary presentation contract and local limits, pending backend agreement.
export const mediaFixture = {
  screen: 'W04',
  locale: 'sk',
  backTarget: 'W03',
  allowedActions: ['back', 'pick', 'remove', 'confirm', 'manual'],
  limits: { bytes: 20 * 1024 * 1024 },
  props: {
    back: 'Späť',
    step: 'Krok 2 z 4',
    progress: 50,
    title: 'Pridajte fotografiu alebo video',
    description: 'Fotografia alebo video pomôžu určiť druh zvieraťa a potrebné kroky.',
    prompt: 'Nahrajte fotku, video alebo odfoťte zviera.',
    limit: 'Dočasný limit ukážky: najviac 20 MB na súbor.',
    gallery: 'Pridať fotografiu alebo video',
    pickerHint: 'Vyberte súbor alebo použite fotoaparát.',
    add: 'Pridať',
    remove: 'Odstrániť súbor',
    removed: 'Súbor bol odstránený',
    removedMany: 'Počet odstránených súborov: {count}',
    removedDescription: 'Odstránené súbory môžete ešte vrátiť späť.',
    invalidTitle: 'Súbor sa nepodarilo pridať',
    tooLargeTitle: 'Súbor je príliš veľký',
    tooLarge: 'Maximálna veľkosť jedného súboru v ukážke je 20 MB. Vyberte menší súbor.',
    undo: 'Vrátiť späť',
    undoAll: 'Vrátiť všetky',
    undoTime: 'Čas na obnovenie',
    dismiss: 'Zavrieť oznámenie',
    confirm: 'Potvrdiť',
    manual: 'Nemám fotografiu',
    manualNotice: 'Manuálny výber zvieraťa ešte pripravujeme.',
    preview: 'Lokálna ukážka: súbory sa nikam neodosielajú a AI rozpoznávanie zatiaľ nie je zapojené.',
    confirmed: 'Súbory sú pripravené iba v tejto ukážke. AI spracovanie a ďalší krok ešte nie sú zapojené.',
    invalid: 'Vyberte fotografiu (JPEG, PNG, WebP) alebo video (MP4, WebM, MOV) do 20 MB.',
    unsupportedPreview: 'Náhľad tohto súboru sa nepodarilo zobraziť.'
  }
}
export type MediaView = typeof mediaFixture
