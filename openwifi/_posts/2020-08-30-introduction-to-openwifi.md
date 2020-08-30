---
layout: post
title: "Start of research: Introduction to OpenWiFi"
tags: openwifi
---

[OpenWiFi](https://github.com/open-sdr/openwifi) is an FPGA[^1] and SDR[^2] implementation of the [IEEE 802.11 a/g/n standard](https://ieeexplore.ieee.org/browse/standards/get-program/page/series?id=68) (WiFi, for us common folk).
Essentially, it's a WiFi chip, like you'd find in your phone or a router, but open source and written in Verilog.
For more introductory reading, see the paper[^3] or the [talk](https://www.youtube.com/watch?v=Mq48cGthk7M&feature=youtu.be) on FOSDEM.
This series of blog posts will document my experiences learning and researching.


## Why?
OpenWiFi exists for research and very little else at this point, as FPGA's are expensive and quite large.
It allows one to test even some [very](https://www.youtube.com/watch?v=Notn9X482LI&feature=youtu.be) [funky ideas](/assets/cross_course_project_openwifi_2020.pdf).
The FPGA can do all kinds of fun stuff that normal WiFi cards don't support (they tend to be really cost-oriented) or won't allow.

For this research project, we'll look at using the openwifi project to do security testing of WiFi networks and develop testing equipment.

## How does it work
Let's go top-down. First there's Linux userspace. The card is seen as a perfectly normal WiFi card and works exactly as you'd expect.
There are some extra userpace tools for managing the FPGA and SDR hardware, but those aren't essential.

Then there's a driver that implements Linux mac80211[^4]. This is what makes it so simple for userspace.
Finally, there's the FPGA code, written in Verilog. I happen to only know VHDL, so this will be fun.

## Goals for this research
It's something about developing test equipment with Keysight. Honestly I don't really know either, I'm just trying to get a grasp of the subject right now.
If I could figure out how to download the standard, that'd be great.

***

[^1]: Field Programmable Gate Array
[^2]: Software Defined Radio
[^3]: X. Jiao, W. Liu, M. Mehari, M. Aslam, and I. Moerman, ‘openwifi: a free and open-source IEEE802.11 SDR implementation on SoC’, in 2020 IEEE 91st Vehicular Technology Conference (VTC2020-Spring), Antwerp, Belgium, May 2020, pp. 1–2, doi: 10.1109/VTC2020-Spring48590.2020.9128614.
[^4]: <https://wireless.wiki.kernel.org/en/users>
