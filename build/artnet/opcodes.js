"use strict";
// Opcodes extracted from the ArtNet spec, including definition
//   https://artisticlicence.com/WebSiteMaster/User%20Guides/art-net.pdf
Object.defineProperty(exports, "__esModule", { value: true });
exports.INDICATOR_NORMAL = exports.INDICATOR_MUTE = exports.INDICATOR_LOCATE = exports.INDICATOR_UNKNOWN = exports.PAPA_UNUSED = exports.PAPA_NETWORK = exports.PAPA_FRONT_PANEL_SET = exports.PAPA_UNKNOWN = exports.DP_VOLATILE = exports.DP_CRITICAL = exports.DP_HIGH = exports.DP_MED = exports.DP_LOW = exports.DP_ALL = exports.OP_DIRECTORY_REPLY = exports.OP_DIRECTORY = exports.OP_TRIGGER = exports.OP_TIME_SYNC = exports.OP_TIME_CODE = exports.OP_MEDIA_CONTROL_REPLY = exports.OP_MEDIA_CONTROL = exports.OP_MEDIA_PATCH = exports.OP_MEDIA = exports.OP_IP_PROG_REPLY = exports.OP_IP_PROG = exports.OP_FILE_FN_REPLY = exports.OP_FILE_FN_MASTER = exports.OP_FILE_TN_MASTER = exports.OP_FIRMWARE_REPLY = exports.OP_FIRMWARE_MASTER = exports.OP_VIDEO_DATA = exports.OP_VIDEO_PALETTE = exports.OP_VIDEO_SETUP = exports.OP_RDM_SUB = exports.OP_RDM = exports.OP_TOD_CONTROL = exports.OP_TOD_DATA = exports.OP_TOD_REQUEST = exports.OP_INPUT = exports.OP_ADDRESS = exports.OP_SYNC = exports.OP_NZS = exports.OP_OUTPUT = exports.OP_COMMAND = exports.OP_DIAG_DATA = exports.OP_POLL_REPLY = exports.OP_POLL = void 0;
// This is an ArtPoll packet, no other data is contained
// in this UDP packet.
exports.OP_POLL = 0x2000;
// This is an ArtPollReply Packet. It contains device
// status information.
exports.OP_POLL_REPLY = 0x2100;
// Diagnostics and data logging packet.
exports.OP_DIAG_DATA = 0x2300;
// Used to send text based parameter commands.
exports.OP_COMMAND = 0x2400;
// This is an ArtDmx data packet. It contains zero start
// code DMX512 information for a single Universe.
exports.OP_OUTPUT = 0x5000;
// This is an ArtNzs data packet. It contains non-zero
// start code (except RDM) DMX512 information for a
// single Universe.
exports.OP_NZS = 0x5100;
// This is an ArtSync data packet. It is used to force
// synchronous transfer of ArtDmx packets to a node’s
// output.
exports.OP_SYNC = 0x5200;
// This is an ArtAddress packet. It contains remote
// programming information for a Node.
exports.OP_ADDRESS = 0x6000;
// This is an ArtInput packet. It contains enable –
// disable data for DMX inputs.
exports.OP_INPUT = 0x7000;
// This is an ArtTodRequest packet. It is used to request
// a Table of Devices (ToD) for RDM discovery.
exports.OP_TOD_REQUEST = 0x8000;
// This is an ArtTodData packet. It is used to send a
// Table of Devices (ToD) for RDM discovery.
exports.OP_TOD_DATA = 0x8100;
// This is an ArtTodControl packet. It is used to send
// RDM discovery control messages.
exports.OP_TOD_CONTROL = 0x8200;
// This is an ArtRdm packet. It is used to send all non
// discovery RDM messages.
exports.OP_RDM = 0x8300;
// This is an ArtRdmSub packet. It is used to send
// compressed, RDM Sub-Device data.
exports.OP_RDM_SUB = 0x8400;
// This is an ArtVideoSetup packet. It contains video
// screen setup information for nodes that implement
// the extended video features.
exports.OP_VIDEO_SETUP = 0xa010;
// This is an ArtVideoPalette packet. It contains colour
// palette setup information for nodes that implement
// the extended video features.
exports.OP_VIDEO_PALETTE = 0xa020;
// This is an ArtVideoData packet. It contains display
// data for nodes that implement the extended video
// features.
exports.OP_VIDEO_DATA = 0xa040;
// This is an ArtFirmwareMaster packet. It is used to
// upload new firmware or firmware extensions to the
// Node.
exports.OP_FIRMWARE_MASTER = 0xf200;
// This is an ArtFirmwareReply packet. It is returned by
// the node to acknowledge receipt of an
// ArtFirmwareMaster packet or ArtFileTnMaster
// packet.
exports.OP_FIRMWARE_REPLY = 0xf300;
// Uploads user file to node.
exports.OP_FILE_TN_MASTER = 0xf400;
// Downloads user file from node.
exports.OP_FILE_FN_MASTER = 0xf500;
// Server to Node acknowledge for download packets.
exports.OP_FILE_FN_REPLY = 0xf600;
// This is an ArtIpProg packet. It is used to re-
// programme the IP address and Mask of the Node.
exports.OP_IP_PROG = 0xf800;
// This is an ArtIpProgReply packet. It is returned by the
// node to acknowledge receipt of an ArtIpProg packet.
exports.OP_IP_PROG_REPLY = 0xf900;
// This is an ArtMedia packet. It is Unicast by a Media
// Server and acted upon by a Controller.
exports.OP_MEDIA = 0x9000;
// This is an ArtMediaPatch packet. It is Unicast by a
// Controller and acted upon by a Media Server.
exports.OP_MEDIA_PATCH = 0x9100;
// This is an ArtMediaControl packet. It is Unicast by a
// Controller and acted upon by a Media Server.
exports.OP_MEDIA_CONTROL = 0x9200;
// This is an ArtMediaControlReply packet. It is Unicast
// by a Media Server and acted upon by a Controller.
exports.OP_MEDIA_CONTROL_REPLY = 0x9300;
// This is an ArtTimeCode packet. It is used to transport
// time code over the network.
exports.OP_TIME_CODE = 0x9700;
// Used to synchronise real time date and clock.
exports.OP_TIME_SYNC = 0x9800;
// Used to send trigger macros.
exports.OP_TRIGGER = 0x9900;
// Requests a node's file list.
exports.OP_DIRECTORY = 0x9a00;
// Replies to OpDirectory with file list.
exports.OP_DIRECTORY_REPLY = 0x9b00;
// Priority codes
// All priorities.
exports.DP_ALL = 0x00;
// Low priority message.
exports.DP_LOW = 0x10;
// Medium priority message.
exports.DP_MED = 0x40;
// High priority message.
exports.DP_HIGH = 0x80;
// Critical priority message.
exports.DP_CRITICAL = 0xe0;
// Volatile message. Messages of this type are displayed
// on a single line in the DMX-Workshop diagnostics
// display. All other types are displayed in a list box.
exports.DP_VOLATILE = 0xf0;
// Port-Address Programming Authority unknown.
exports.PAPA_UNKNOWN = 0x00;
// All Port-Address set by front panel controls.
exports.PAPA_FRONT_PANEL_SET = 0x01;
// All or part of Port-Address programmed by network or Web
// browser.
exports.PAPA_NETWORK = 0x02;
// Not used.
exports.PAPA_UNUSED = 0x03;
// Indicator state unknown.
exports.INDICATOR_UNKNOWN = 0x00;
// Indicators in Locate / Identify Mode.
exports.INDICATOR_LOCATE = 0x01;
// Indicators in Mute Mode.
exports.INDICATOR_MUTE = 0x02;
// Indicators in Normal Mode.
exports.INDICATOR_NORMAL = 0x03;
//# sourceMappingURL=opcodes.js.map