# API

Local Node HTTP command and status boundary. Production can later move this
composition root to Supabase Edge Functions without changing the contracts.

The API is the sole public domain-command boundary. It:

- validates versioned contracts;
- authenticates a case capability;
- invokes the event-store adapter;
- returns explicit, non-sensitive command and status results.

It does not proxy bulk media, expose tables directly to browsers, or log
capabilities, command bodies, or `Authorization` headers.

## Local endpoints

`npm run dev` starts isolated Postgres and this process on
`http://127.0.0.1:8787`.

| Method | Path        | Auth                                    | Purpose                        |
| ------ | ----------- | --------------------------------------- | ------------------------------ |
| `GET`  | `/health`   | none                                    | liveness                       |
| `POST` | `/commands` | `Authorization: Capability <base64url>` | reporter draft commands        |
| `GET`  | `/status`   | `Authorization: Capability <base64url>` | public `draft/received/closed` |

Reporter commands in this slice: `create_draft`, `attach_private_data`,
`submit_draft`. Administrator and system commands return `UNSUPPORTED_COMMAND`.
Query strings on `/commands` and `/status` are rejected (`AH-SEC-007`).
