import {
  createHash,
  generateKeyPairSync,
  randomBytes,
  sign,
} from "node:crypto";

import { isoCBOR } from "@simplewebauthn/server/helpers";

type RegistrationOptions = {
  rp: { id: string };
  challenge: string;
  user: { id: string };
};

type AuthenticationOptions = {
  rpId: string;
  challenge: string;
};

export const softwarePasskey = () => {
  const { privateKey, publicKey } = generateKeyPairSync("ec", {
    namedCurve: "prime256v1",
  });
  const jwk = publicKey.export({ format: "jwk" });
  if (jwk.x === undefined || jwk.y === undefined) {
    throw new Error("expected P-256 public key coordinates");
  }
  const id = randomBytes(32);
  const encodedId = id.toString("base64url");
  const cose = encodeCbor(
    new Map<number, number | Uint8Array>([
      [1, 2],
      [3, -7],
      [-1, 1],
      [-2, new Uint8Array(Buffer.from(jwk.x, "base64url"))],
      [-3, new Uint8Array(Buffer.from(jwk.y, "base64url"))],
    ]),
  );
  let userHandle: string | undefined;
  let counter = 0;

  return {
    register(options: RegistrationOptions, origin: string, verified = true) {
      userHandle = options.user.id;
      const data = clientData("webauthn.create", options.challenge, origin);
      const length = Buffer.alloc(2);
      length.writeUInt16BE(id.length);
      const authData = Buffer.concat([
        digest(options.rp.id),
        Buffer.from([verified ? 0x45 : 0x41]),
        Buffer.alloc(4),
        Buffer.alloc(16),
        length,
        id,
        Buffer.from(cose),
      ]);
      const attestation = encodeCbor(
        new Map<string, unknown>([
          ["fmt", "none"],
          ["attStmt", new Map()],
          ["authData", new Uint8Array(authData)],
        ]),
      );
      return {
        id: encodedId,
        rawId: encodedId,
        type: "public-key",
        authenticatorAttachment: "platform",
        clientExtensionResults: {},
        response: {
          clientDataJSON: data.toString("base64url"),
          attestationObject: Buffer.from(attestation).toString("base64url"),
          transports: ["internal"],
        },
      };
    },
    authenticate(
      options: AuthenticationOptions,
      origin: string,
      verified = true,
    ) {
      const data = clientData("webauthn.get", options.challenge, origin);
      const count = Buffer.alloc(4);
      count.writeUInt32BE(++counter);
      const authData = Buffer.concat([
        digest(options.rpId),
        Buffer.from([verified ? 5 : 1]),
        count,
      ]);
      const signature = sign(
        "sha256",
        Buffer.concat([authData, digest(data)]),
        privateKey,
      );
      return {
        id: encodedId,
        rawId: encodedId,
        type: "public-key",
        clientExtensionResults: {},
        response: {
          clientDataJSON: data.toString("base64url"),
          authenticatorData: authData.toString("base64url"),
          signature: signature.toString("base64url"),
          userHandle,
        },
      };
    },
  };
};

const clientData = (type: string, challenge: string, origin: string): Buffer =>
  Buffer.from(JSON.stringify({ type, challenge, origin, crossOrigin: false }));

const digest = (value: string | Buffer): Buffer =>
  createHash("sha256").update(value).digest();

const encodeCbor = (value: unknown): Uint8Array =>
  isoCBOR.encode(value as Parameters<typeof isoCBOR.encode>[0]);
