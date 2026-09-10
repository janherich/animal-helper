import type { WalkView } from "./walk-view.js";

export const situationWalkViewFixture = {
  schemaVersion: 1,
  screen: "situation",
  path: "/w01",
  screenKeys: ["w01"],
  allowedCommands: ["create_draft"],
  fieldErrors: [],
  props: {
    situations: ["injured", "stray"],
  },
} as const satisfies WalkView;

export const locationWalkViewFixture = {
  schemaVersion: 1,
  screen: "location",
  path: "/w03",
  screenKeys: ["w03a", "w03b"],
  allowedCommands: ["attach_location"],
  fieldErrors: [],
  props: {},
} as const satisfies WalkView;

export const photoWalkViewFixture = {
  schemaVersion: 1,
  screen: "photo",
  path: "/w04",
  screenKeys: ["w04"],
  allowedCommands: ["continue"],
  fieldErrors: [],
  props: {},
} as const satisfies WalkView;

export const detailsWalkViewFixture = {
  schemaVersion: 1,
  screen: "details",
  path: "/w09",
  screenKeys: ["w04", "w09", "w09b", "w11"],
  allowedCommands: ["attach_form_snapshot"],
  fieldErrors: [],
  props: {
    situationType: "injured",
    kinds: [
      {
        key: "domestic_cat",
        groupKey: "domestic",
        categoryKey: "companion",
        labelSk: "Mačka",
        askConscious: true,
        askJuvenile: true,
      },
    ],
  },
} as const satisfies WalkView;

export const guideWalkViewFixture = {
  schemaVersion: 1,
  screen: "guide",
  path: "/w14",
  screenKeys: ["w14"],
  allowedCommands: ["continue"],
  fieldErrors: [],
  props: {
    kindKey: "domestic_cat",
    revisionId: "bundled",
    items: [
      {
        screenKey: "w14",
        instructionKey: "warning.do_not",
        polarity: "do_not",
        slots: {
          "warning.do_not": "Synthetic do-not line",
        },
      },
    ],
  },
} as const satisfies WalkView;

export const contactWalkViewFixture = {
  schemaVersion: 1,
  screen: "contact",
  path: "/w24",
  screenKeys: ["w24"],
  allowedCommands: ["attach_contact", "submit_draft"],
  fieldErrors: [],
  props: {},
} as const satisfies WalkView;

export const thanksWalkViewFixture = {
  schemaVersion: 1,
  screen: "thanks",
  path: "/thank-you",
  screenKeys: ["thanks"],
  allowedCommands: [],
  fieldErrors: [],
  props: {
    publicState: "received",
  },
} as const satisfies WalkView;

export const walkViewFixtures = {
  situation: situationWalkViewFixture,
  location: locationWalkViewFixture,
  photo: photoWalkViewFixture,
  details: detailsWalkViewFixture,
  guide: guideWalkViewFixture,
  contact: contactWalkViewFixture,
  thanks: thanksWalkViewFixture,
} as const;
