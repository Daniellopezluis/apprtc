/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */

/* More information about these options at jshint.com/docs/options */

/* globals describe, expect, it, maybePreferCodec, removeCodecParam,
   setCodecParam */

'use strict';

describe('Sdp utils test', function() {
  var SDP_WITH_AUDIO_CODECS =
    ['v=0',
     'm=audio 9 RTP/SAVPF 111 103 104 0 9',
     'a=rtcp-mux',
     'a=rtpmap:111 opus/48000/2',
     'a=fmtp:111 minptime=10',
     'a=rtpmap:103 ISAC/16000',
     'a=rtpmap:9 G722/8000',
     'a=rtpmap:0 PCMU/8000',
     'a=rtpmap:8 PCMA/8000',
    ].join('\r\n');

  it('moves Isac 16K To Default When Preferred', function() {
    var result = maybePreferCodec(SDP_WITH_AUDIO_CODECS, 'audio', 'send',
                                  'iSAC/16000');
    var audioLine = result.split('\r\n')[1];
    expect(audioLine).toEqual('m=audio 9 RTP/SAVPF 103 111 104 0 9');
  });

  it('does Nothing If Preferred Codec Not Found', function() {
    var result = maybePreferCodec(SDP_WITH_AUDIO_CODECS, 'audio', 'send',
                                  'iSAC/123456');
    var audioLine = result.split('\r\n')[1];
    expect(audioLine).toEqual(SDP_WITH_AUDIO_CODECS.split('\r\n')[1]);
  });

  it('moves Codec Even If Payload Type Is Same As Udp Port', function() {
    var result = maybePreferCodec(SDP_WITH_AUDIO_CODECS,
                                    'audio',
                                    'send',
                                    'G722/8000');
    var audioLine = result.split('\r\n')[1];
    expect(audioLine).toEqual('m=audio 9 RTP/SAVPF 9 111 103 104 0');
  });

  it('moves Codec Even If Payload Type Is Same As Udp Port', function() {
    var result = setCodecParam(SDP_WITH_AUDIO_CODECS, 'opus/48000',
                                 'minptime', '20');
    var audioLine = result.split('\r\n')[4];
    expect(audioLine).toEqual('a=fmtp:111 minptime=20');

    result = setCodecParam(result, 'opus/48000', 'useinbandfec', '1');
    audioLine = result.split('\r\n')[4];
    expect(audioLine).toEqual('a=fmtp:111 minptime=20; useinbandfec=1');

    result = removeCodecParam(result, 'opus/48000', 'minptime');
    audioLine = result.split('\r\n')[4];
    expect(audioLine).toEqual('a=fmtp:111 useinbandfec=1');

    var newResult = removeCodecParam(result, 'opus/48000', 'minptime');
    expect(newResult).toEqual(result);
  });

  it('remove And Set Codec Param Modify Fmtp Line', function() {
    var result = setCodecParam(SDP_WITH_AUDIO_CODECS, 'opus/48000',
                                 'minptime', '20');
    var audioLine = result.split('\r\n')[4];
    expect(audioLine).toEqual('a=fmtp:111 minptime=20');

    result = setCodecParam(result, 'opus/48000', 'useinbandfec', '1');
    audioLine = result.split('\r\n')[4];
    expect(audioLine).toEqual('a=fmtp:111 minptime=20; useinbandfec=1');

    result = removeCodecParam(result, 'opus/48000', 'minptime');
    audioLine = result.split('\r\n')[4];
    expect(audioLine).toEqual('a=fmtp:111 useinbandfec=1');

    var newResult = removeCodecParam(result, 'opus/48000', 'minptime');
    expect(newResult).toEqual(result);
  });

  it('remove And Set Codec Param Remove And Add Fmtp Line If Needed',
      function() {
    var result = removeCodecParam(SDP_WITH_AUDIO_CODECS, 'opus/48000',
                                  'minptime');
    var audioLine = result.split('\r\n')[4];
    expect(audioLine).toEqual('a=rtpmap:103 ISAC/16000');
    result = setCodecParam(result, 'opus/48000', 'inbandfec', '1');
    audioLine = result.split('\r\n')[4];
    expect(audioLine).toEqual('a=fmtp:111 inbandfec=1');
  });
});
