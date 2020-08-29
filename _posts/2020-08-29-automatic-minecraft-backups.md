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

## RCON
What we really need is a way to tell the Minecraft server to save everything it's got in the queue and then stop writing until we tell it to start writing again. If we had access to the console, that would be easy. Just a simple `save-all flush` and `save-off`, copy the files and do `save-on`. But we are writing a script, accessing the console is a pain.

Enter RCON. RCON is a protocol you can use to remotely send commands to a Minecraft server. This could even go over the internet if you really wanted to! We don't want that though, because RCON has OP level access.

First we have to enable RCON on our server. For that, we need to set the `enable-rcon=true` option in `server.properties` and choose a password in `rcon.password=passw0rd`. Restart the server.

Connecting to RCON is slightly complicated, but luckily Tiiffi has made [mcrcon](https://github.com/Tiiffi/mcrcon). After installing it, we can easily send any command we like over to our minecraft server.

## The final result
The final script looks like this and is called daily using a cron job:

{% gist d57193bedfc3d134bb1e371651638f85 %}
