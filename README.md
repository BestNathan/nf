# Nathan Frida Hooks

## features

- Tracing from method to method within a complete encryption or http processing
- Hook Java Crypto
  - Print Crypto Key in UTF-8/Hex/Base64
  - Print Crypto Iv in Hex
  - Print plain text in UTF-8/Hex
  - Print cipher text in Hex/Base64
- Hook OkHttp3/Android UrlConnection
  - Print Http Request Url, Method, Headers, Data(if possible) in UTF-8/Hex
  - Print Http Response Code, Headers, Data(if possible) in UTF-8/Hex/Base64

## Usage

```sh
npm install
# ./built/index.js

frida -U -f com.example.android -l ./built/index.js
```

## Development

```sh
npm run watch
# ./built/index.js

frida -U -f com.example.android -l ./built/index.js
```

## TODOs

- [ ] ObjC Hooks
  - [ ] Crypto
  - [ ] Http
- [ ] Enable Hooks in need
- [ ] Tool chains
