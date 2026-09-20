# Cruelty intermediate screens — working contract

Fixture-only case preview: no submissions. On iPhone/Android phones the call button requests the OS handler for a
validated phone URI supplied by the fixture. Desktop only advances to W28. Device detection is a conservative user-agent
hint, not proof of telephony support; the app cannot infer whether a call connected or was cancelled.

- Home cruelty entry → W27, before location.
- Non-acute → W03 location → W04 media.
- Call button → W28 reporting outcome (also requests system calling on phones).
- Reported → W29 acknowledgement → Document case → W03.
- Not reported → W30 optional reasons → Document case → W03.

Each screen has its own route and transition. Back uses allowed router history with a safe fallback. Location returns to
its actual W27/W29/W30 entry. Other home entries still go directly to location; media returns to location.

CrueltyView and CrueltyFollowupView hold presentation copy, reasons and actions. The local session stores crueltyReport:
outcome (reported/not-reported), reason IDs and optional description. Multiple reasons are optional, per wireframe
notes. Other expands optional text (preview maximum 2000 characters); unchecking excludes that text. Returning preserves
answers; changing outcome clears old reasons. Non-acute clears the outcome; beginning a new case clears the session.

This is a proposed contract, not a finished API. Backend validation, business decisions and submission remain
unconnected.
