# hayacrypt

AES-256-GCM encryption using passphrase-derived keys (scrypt). Zero dependencies.

## Install

```
npm install hayacrypt
```

## CLI

```
hayacrypt encrypt --in plain.txt --passphrase secret --out encrypted.txt
hayacrypt decrypt --in encrypted.txt --passphrase secret --out decrypted.txt
```

`--in` and `--out` can be files or directories. Directories are processed recursively, preserving structure.

## API

```ts
import { encryptString, decryptString } from 'hayacrypt'

const encrypted = encryptString('hello', 'my-passphrase')
const decrypted = decryptString(encrypted, 'my-passphrase') // 'hello'
```

## License

Apache-2.0
