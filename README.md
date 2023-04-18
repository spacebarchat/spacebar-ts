# Spacebar-ts

WIP API library for the Spacebar API

## Example

```typescript
import { Client } from "spacebar-ts";

let client = new Client();

client.on("ready", async () =>
	console.info(`Logged in as ${client.user!.username}!`),
);

client.on("message", async (message) => {
	if (message.content === "hello") {
		message.channel!.sendMessage("world");
	}
});

client.loginBot("token");
```

## MobX

MobX is used behind the scenes so you can subscribe to any change as you normally would, e.g. with `mobx-react(-lite)` or mobx's utility functions.

```typescript
import { autorun } from 'mobx';

[..]

client.once('ready', () => {
    autorun(() => {
        console.log(`Current username is ${client.user!.username}!`);
    });
});
```

## Spacebar API Types

All `@spacebarchat/spacebar-types` types are re-exported under `API`.

```typescript
import { API } from "spacebar-ts";

// API.Channel;
// API.[..];
```
