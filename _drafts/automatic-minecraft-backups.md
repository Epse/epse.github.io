---
layout: post
title: "Automatic Minecraft backups"
tags: minecraft
---

Say you run a Minecraft server (like [EndTech](https://endte.ch)) and you want it to backup automatically and manually.
This is needed because people make mistakes or your players like to experiment, which might crash the game.

A minecraft world is simply a folder called `world`, which you could just copy to another location.
Once it's there, you can expose it to the internet, copy it over to an offsite location (using e.g. `rclone`)
or just copy it to another disk.

There are, of course, a few issues with simple `cp`:

1. The server can't have pending writes before the backup start
2. The server can't write to disk while the backup is running
3. Ideally, the server can't shut down during backup
4. The backup process can't corrupt the backup or the currently running world

A simple `cp` will just not do for this. It might work fine _most of the time_,
but invariably that one time it does go wrong, is the time you really really needed a backup.
