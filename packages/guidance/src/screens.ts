import {
  customerWalkSteps,
  type CustomerWalkStep,
  type ScreenKey,
} from "./keys.js";

export type ScreenStatus = "implemented" | "collapsed" | "skipped" | "planned";

export type ScreenDefinition = {
  key: ScreenKey;
  role: string;
  status: ScreenStatus;
  customerPath?: string;
  customerStep?: CustomerWalkStep;
};

export const screens = {
  w01: {
    key: "w01",
    role: "Situation type",
    status: "implemented",
    customerPath: "/w01",
    customerStep: "situation",
  },
  w02: {
    key: "w02",
    role: "Acute 158 branch for cruelty",
    status: "planned",
  },
  w03a: {
    key: "w03a",
    role: "Location from device",
    status: "collapsed",
    customerPath: "/w03",
    customerStep: "location",
  },
  w03b: {
    key: "w03b",
    role: "Location as address",
    status: "collapsed",
    customerPath: "/w03",
    customerStep: "location",
  },
  w04: {
    key: "w04",
    role: "Photo or evidence capture",
    status: "skipped",
    customerPath: "/w09",
    customerStep: "details",
  },
  w06a: {
    key: "w06a",
    role: "Cruelty checkboxes",
    status: "planned",
  },
  w06b: {
    key: "w06b",
    role: "Species-specific cruelty checkboxes",
    status: "planned",
  },
  w09: {
    key: "w09",
    role: "Condition / symptoms",
    status: "collapsed",
    customerPath: "/w09",
    customerStep: "details",
  },
  w09b: {
    key: "w09b",
    role: "Other-condition description",
    status: "collapsed",
    customerPath: "/w09",
    customerStep: "details",
  },
  w11: {
    key: "w11",
    role: "Free-text description",
    status: "collapsed",
    customerPath: "/w09",
    customerStep: "details",
  },
  w13: {
    key: "w13",
    role: "Do-not warning",
    status: "planned",
  },
  w14: {
    key: "w14",
    role: "Do-before-contact warning",
    status: "planned",
  },
  w15: {
    key: "w15",
    role: "Primary typed contact",
    status: "planned",
  },
  w16: {
    key: "w16",
    role: "Warning variant",
    status: "planned",
  },
  w17: {
    key: "w17",
    role: "Warning variant",
    status: "planned",
  },
  w18: {
    key: "w18",
    role: "Veterinary clinic contact",
    status: "planned",
  },
  w19: {
    key: "w19",
    role: "Secondary clinic or partner organisation",
    status: "planned",
  },
  w20: {
    key: "w20",
    role: "Emergency 112 / police",
    status: "planned",
  },
  w21: {
    key: "w21",
    role: "Volunteers",
    status: "planned",
  },
  w22: {
    key: "w22",
    role: "Self-help intro",
    status: "planned",
  },
  w23: {
    key: "w23",
    role: "Self-help steps",
    status: "planned",
  },
  w24: {
    key: "w24",
    role: "Reporter contact in the PWA; who-helped in the matrices",
    status: "implemented",
    customerPath: "/w24",
    customerStep: "contact",
  },
  w25a: {
    key: "w25a",
    role: "Why help failed",
    status: "planned",
  },
  w25b: {
    key: "w25b",
    role: "Why help failed, continued",
    status: "planned",
  },
  w26: {
    key: "w26",
    role: "Volunteer SLA",
    status: "planned",
  },
  thanks: {
    key: "thanks",
    role: "Post-submit status",
    status: "implemented",
    customerPath: "/thank-you",
    customerStep: "thanks",
  },
} as const satisfies Record<ScreenKey, ScreenDefinition>;

export type CustomerWalkRoute = {
  step: CustomerWalkStep;
  path: string;
  matrixScreens: readonly ScreenKey[];
};

export const customerImplementedWalk: Record<
  CustomerWalkStep,
  CustomerWalkRoute
> = {
  situation: {
    step: "situation",
    path: "/w01",
    matrixScreens: ["w01"],
  },
  location: {
    step: "location",
    path: "/w03",
    matrixScreens: ["w03a", "w03b"],
  },
  details: {
    step: "details",
    path: "/w09",
    matrixScreens: ["w04", "w09", "w09b", "w11"],
  },
  contact: {
    step: "contact",
    path: "/w24",
    matrixScreens: ["w24"],
  },
  thanks: {
    step: "thanks",
    path: "/thank-you",
    matrixScreens: ["thanks"],
  },
};

export const customerWalkPath = (
  step: CustomerWalkStep,
): (typeof customerImplementedWalk)[CustomerWalkStep]["path"] =>
  customerImplementedWalk[step].path;

export const customerWalkOrder = customerWalkSteps.map(
  (step) => customerImplementedWalk[step],
);
