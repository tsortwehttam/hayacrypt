# hayacrypt

AES-256-GCM encryption using passphrase-derived keys (scrypt). Zero dependencies.

## Install

```
npm install hayacrypt
```

## CLI

```
hayacrypt encrypt --infile plain.txt --passphrase secret --outfile encrypted.txt
hayacrypt decrypt --infile encrypted.txt --passphrase secret --outfile decrypted.txt
```

## API

```ts
import { encryptString, decryptString } from 'hayacrypt'

const encrypted = encryptString('hello', 'my-passphrase')
const decrypted = decryptString(encrypted, 'my-passphrase') // 'hello'
```

## License

Apache-2.0
