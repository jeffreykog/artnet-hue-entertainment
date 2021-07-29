# ArtNet Hue Entertainment

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE.txt)

The well-known Philips/Signify Hue API only allows for about 10 updates per second.
If you want to update multiple lights multiple times per second this approach will not scale.
To make this practical, all color transitions will need to be done inside the Hue bulb.
This complicates light programming, as Hue bulbs can not be used as any other RGB DMX light.
As this is the only well-known Hue API, this is what most other Hue ArtNet bridges use. 

Since the introduction of the Hue Sync Box, a new API is available allowing up to
25 updates per second for up to 10 lights. This gives us almost real-time control over
lights, even with perfect synchronization between the lights.
This is called the Hue Entertainment API.

To accomplish this, the Hue Bridge sends the entire update packet, which contains
color information for all bulbs in the Entertainment group, to a 'Proxy' bulb.
This is a bulb that is elected by the Hue bridge to be near all other bulbs in the
Entertainment group. It will receive the full color update for all bulbs and it will
broadcast the message so all bulbs receive it. Then every individual bulb will only
take it's own color from the update message and apply it.
This accomplishes near-perfect synchronization.

Please note that only original Philips/Signify Hue color bulbs are supported.
This means Ikea Tradfri bulbs can not be used, neither can Hue white bulbs.
This is a limitation in the protocol and can not be worked around.

If you need to support non-color or non-Hue bulbs as well, you should check out
another project which talks to the normal Hue API, such as [Dmx-Hue](https://github.com/sinedied/dmx-hue).

## Setting up
To start using ArtNet-Hue-Entertainment, take the following steps:
1. First, open the Philips Hue app on your phone
   and setup a new Entertainment group.
   This can be done by navigating to `Settings > Entertainment rooms`.
2. If you don't have an entertainment group yet, create one by tapping
   the blue plus button on the top right, give the entertainment room a name
   and select some lights.
   Placement of the bulbs is not important and will be ignored.
3. This project really is still work in progress. More to come!
