# Jurisdiction packs

A jurisdiction pack contains versioned operational data, not UI translations:

- authority and volunteer directory entries with source and verification date;
- routing criteria and administrator guidance;
- official-form templates and field mappings;
- recipient/channel constraints;
- jurisdiction-specific privacy/legal notice references.

Packs are reviewed data with provenance. They never contain provider credentials
or case data. A generated document snapshots its pack/template version so a
later official-form update does not rewrite history.

Customer guidance may reference a typed, public-safe contact action by stable
directory key. Guidance publication pins the jurisdiction-pack version and
snapshots the resolved public target so a later directory update cannot silently
rewrite already published advice.
