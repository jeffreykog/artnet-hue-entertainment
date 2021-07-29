
// Opcodes extracted from the ArtNet spec, including definition
//   https://artisticlicence.com/WebSiteMaster/User%20Guides/art-net.pdf

// This is an ArtPoll packet, no other data is contained
// in this UDP packet.
export const OP_POLL = 0x2000;
// This is an ArtPollReply Packet. It contains device
// status information.
export const OP_POLL_REPLY = 0x2100;
// Diagnostics and data logging packet.
export const OP_DIAG_DATA = 0x2300;
// Used to send text based parameter commands.
export const OP_COMMAND = 0x2400;
// This is an ArtDmx data packet. It contains zero start
// code DMX512 information for a single Universe.
export const OP_OUTPUT = 0x5000;
// This is an ArtNzs data packet. It contains non-zero
// start code (except RDM) DMX512 information for a
// single Universe.
export const OP_NZS = 0x5100;
// This is an ArtSync data packet. It is used to force
// synchronous transfer of ArtDmx packets to a node’s
// output.
export const OP_SYNC = 0x5200;
// This is an ArtAddress packet. It contains remote
// programming information for a Node.
export const OP_ADDRESS = 0x6000;
// This is an ArtInput packet. It contains enable –
// disable data for DMX inputs.
export const OP_INPUT = 0x7000;
// This is an ArtTodRequest packet. It is used to request
// a Table of Devices (ToD) for RDM discovery.
export const OP_TOD_REQUEST = 0x8000;
// This is an ArtTodData packet. It is used to send a
// Table of Devices (ToD) for RDM discovery.
export const OP_TOD_DATA = 0x8100;
// This is an ArtTodControl packet. It is used to send
// RDM discovery control messages.
export const OP_TOD_CONTROL = 0x8200;
// This is an ArtRdm packet. It is used to send all non
// discovery RDM messages.
export const OP_RDM = 0x8300;
// This is an ArtRdmSub packet. It is used to send
// compressed, RDM Sub-Device data.
export const OP_RDM_SUB = 0x8400;
// This is an ArtVideoSetup packet. It contains video
// screen setup information for nodes that implement
// the extended video features.
export const OP_VIDEO_SETUP = 0xa010;
// This is an ArtVideoPalette packet. It contains colour
// palette setup information for nodes that implement
// the extended video features.
export const OP_VIDEO_PALETTE = 0xa020;
// This is an ArtVideoData packet. It contains display
// data for nodes that implement the extended video
// features.
export const OP_VIDEO_DATA = 0xa040;
// This is an ArtFirmwareMaster packet. It is used to
// upload new firmware or firmware extensions to the
// Node.
export const OP_FIRMWARE_MASTER = 0xf200;
// This is an ArtFirmwareReply packet. It is returned by
// the node to acknowledge receipt of an
// ArtFirmwareMaster packet or ArtFileTnMaster
// packet.
export const OP_FIRMWARE_REPLY = 0xf300;
// Uploads user file to node.
export const OP_FILE_TN_MASTER = 0xf400;
// Downloads user file from node.
export const OP_FILE_FN_MASTER = 0xf500;
// Server to Node acknowledge for download packets.
export const OP_FILE_FN_REPLY = 0xf600;
// This is an ArtIpProg packet. It is used to re-
// programme the IP address and Mask of the Node.
export const OP_IP_PROG = 0xf800;
// This is an ArtIpProgReply packet. It is returned by the
// node to acknowledge receipt of an ArtIpProg packet.
export const OP_IP_PROG_REPLY = 0xf900;
// This is an ArtMedia packet. It is Unicast by a Media
// Server and acted upon by a Controller.
export const OP_MEDIA = 0x9000
// This is an ArtMediaPatch packet. It is Unicast by a
// Controller and acted upon by a Media Server.
export const OP_MEDIA_PATCH = 0x9100;
// This is an ArtMediaControl packet. It is Unicast by a
// Controller and acted upon by a Media Server.
export const OP_MEDIA_CONTROL = 0x9200;
// This is an ArtMediaControlReply packet. It is Unicast
// by a Media Server and acted upon by a Controller.
export const OP_MEDIA_CONTROL_REPLY = 0x9300;
// This is an ArtTimeCode packet. It is used to transport
// time code over the network.
export const OP_TIME_CODE = 0x9700;
// Used to synchronise real time date and clock.
export const OP_TIME_SYNC = 0x9800;
// Used to send trigger macros.
export const OP_TRIGGER = 0x9900;
// Requests a node's file list.
export const OP_DIRECTORY = 0x9a00;
// Replies to OpDirectory with file list.
export const OP_DIRECTORY_REPLY = 0x9b00;

// Priority codes

// All priorities.
export const DP_ALL = 0x00;
// Low priority message.
export const DP_LOW = 0x10;
// Medium priority message.
export const DP_MED = 0x40;
// High priority message.
export const DP_HIGH = 0x80;
// Critical priority message.
export const DP_CRITICAL = 0xe0;
// Volatile message. Messages of this type are displayed
// on a single line in the DMX-Workshop diagnostics
// display. All other types are displayed in a list box.
export const DP_VOLATILE = 0xf0;

// Port-Address Programming Authority unknown.
export const PAPA_UNKNOWN = 0x00;
// All Port-Address set by front panel controls.
export const PAPA_FRONT_PANEL_SET = 0x01;
// All or part of Port-Address programmed by network or Web
// browser.
export const PAPA_NETWORK = 0x02;
// Not used.
export const PAPA_UNUSED = 0x03;

// Indicator state unknown.
export const INDICATOR_UNKNOWN = 0x00;
// Indicators in Locate / Identify Mode.
export const INDICATOR_LOCATE = 0x01;
// Indicators in Mute Mode.
export const INDICATOR_MUTE = 0x02;
// Indicators in Normal Mode.
export const INDICATOR_NORMAL = 0x03;
