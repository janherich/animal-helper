// Local bootstrap fallback until a server-provided shell view is available.
export const shellFixture = {
  locale: 'sk',
  homeTarget: '/',
  props: {
    brand: 'Zverolinka',
    home: 'Zverolinka – domov',
    skip: 'Preskočiť na obsah',
    openMenu: 'Otvoriť menu',
    closeMenu: 'Zatvoriť menu',
    menu: 'Hlavné menu',
    navigation: 'Hlavná navigácia',
    welcome: 'Vitajte v Zverolinke',
    unavailable: '{label}: túto časť aplikácie pripravujeme.'
  },
  menuItems: [
    { label: 'Moje prípady', icon: 'my-cases', target: '/' },
    { label: 'Domov', icon: 'about', target: '/' },
    { label: 'Časté otázky a návody', icon: 'faq', target: null },
    { label: 'Staň sa dobrovoľníkom', icon: 'volunteer', target: null },
    { label: 'Podpor Zverolinku', icon: 'donation', target: null }
  ],
  socials: [
    { name: 'Facebook', icon: 'facebook' },
    { name: 'Instagram', icon: 'instagram' },
    { name: 'LinkedIn', icon: 'linkedin' },
    { name: 'TikTok', icon: 'tiktok' }
  ]
}
