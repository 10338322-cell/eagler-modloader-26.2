# Add-ons

JavaScript add-ons for the web page itself, not the game: every `.js` file here is inserted into the
finished HTML as its own script, before the game starts (in file-name order). Use this for things a
Fabric mod can't do from inside the browser game, like changing how the page connects to servers.

| Add-on | What it does | By | License |
|---|---|---|---|
| `wispcraft.js` | Join regular Java Edition servers through a Wisp proxy, including online-mode servers: sign in with a Microsoft account, encryption and skins. | [Mercury Workshop](https://github.com/MercuryWorkshop/wispcraft) (uses [epoxy-tls](https://github.com/r58Playz/epoxy-tls)) | ISC |

Only add scripts you trust: an add-on runs with full access to the game page.
