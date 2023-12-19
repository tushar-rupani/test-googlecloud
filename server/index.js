const express = require("express");
const speech = require("@google-cloud/speech");

//use logger
const logger = require("morgan");

//use body parser
const bodyParser = require("body-parser");

//use corrs
const cors = require("cors");

const http = require("http");
const { Server } = require("socket.io");

const app = express();

app.use(cors());
app.use(logger("dev"));

app.use(bodyParser.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

//TODO: Create this file in the server directory of the project

const speechClient = new speech.SpeechClient({
  credentials: {
    type: 'service_account',
    project_id: 'bluemind-d6c37',
    private_key_id: 'ee8b8ca0f6bacd0969836993e7d7c7556050ad72',
    private_key:
      '-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCYkFo2kccPhI/M\nMQoJOpokv+Ue2MFZwSHEZ5ncBnIhWnrnl7V+PTU/zc5M2sIRKY5wQHXiE0mEbHus\nUCV2wn4SR82hPksFlAOFt/Upel6O5lSuFJNhmUjZeQf1NGx/O60fycvFCTP1zIal\nl7dtJUniwuRSCt2Qh8X1t9edp9wvh/HDIzvJRSXXjNIlPs1myBLbsgcIrt3GaJGD\n5QgyIJOHvj1HiP2rNBtGjvIbQm1uspIKqOGbhGgJ9zPr8bTaAHd7OcJneHnMfgRJ\n6WL283F6HiEHuYl39oPm4yQDDqPO5miijS0GW5KBDmaZkkSz+ibaxUbF9pu4LXIj\n7kUXMr0dAgMBAAECggEAIkIN4+GNscQaVydu4b4lRVnKzQeuuSUXXEdIQyI2aBtt\nbEpCgK+lYKep6tOXjuuGNtoerm6WzFPg3INdukJ3tUqm182JYp4HQXRaqp72E0AQ\n5UstAhY9x8m3+f103IgtuqzhYyQLJSdxV8dO8sUUB4WsZ+jVMmJulxvaYKZEGO7k\n3smjJye6B3TqDpyYC5t7o78pRgCNmgbaA9bHimVmJc4nJJ4V9IcynfQix2xjgH3E\nE9uiMYESesiSHdws7egbKTAlHAB/DxexaacJlJBrxvIk3/DUrL9IkW1bjSq328wR\nEv5T7KCef2hm5CYWYhn9NxLxha8AEVKgBkQxR9ZQuQKBgQDHBlAfmUisr/WTvI8H\niASOeeGszZeOwYW+Q1hANOzOPmBmQE1Pn12hsQiPjasuHlVbjE5AfYaOdLCFqyVg\norl3Uhh34KniKREP8gs1ioKVrJmIfIBf5ZPHEzUpxnPldleQeE1ywE37fEWrz6gA\n1pt4FUmbEDZc7u4qugxnr0P4BQKBgQDEPR9W2Xdd2DF7m09XXnPJxQnMFCdZntJc\nAn+h0vmiIowOleVbSvFImXKX4PGkJoA/Jm/IHJUQCeM1kSptGV5+DYbBWZbcFJJg\nf+M8TK45jhppPBLOoCRgifC75y2SYd2yeMZl7UXv10HBWbMuUjgft2uT+KVXvTFk\nII0XHIm0OQKBgQCBq2hKnikOcfpTjhe2NXWaimhxmOW02ftUcjYuZw0edt+B30U/\nqjpr3ZcRSKEOBC9i3TAirmYbrIVSIabRplOmHTPZ7uNgeZcnR3DsKllYQUMq/Mr7\nL+2vV6FcnXLnPspgUzFKoWZtgpM2FK6GFUzn2R7Cy7ZPqFA+QEdSyotDLQKBgCec\nou/YE+VIl6x4zEo5kavf7ztXsh3AFnxmMLdMrAFTcewby+FivlPGTcBkssJM10Ro\nENZXFqvXIxsUA3lkTpOpTVNIL1CbgnSiPA9W9zA9BA3MB4vX/Z/TGFoFr0hGIwc8\no+e9PonMbMSHw8iM5jFYyAllfpK4aPjqLTDGHPHZAoGBAIA6JrFWCw0XA1Pjpbw4\ndX79tqlunFjnkFqmk7K36zcyWrDZZJyXcx5wMiCoKqftewyTgkRGMUtKEn6b0OyL\nMJEzcJnvwlzP0L0Vu3mUaibGgyyOk4Uhz3M+IDXpyZZwlkUMqEp2DPRi5Nmwr3gm\ni7MYk8kW7FWqtUPGUk05HpLR\n-----END PRIVATE KEY-----\n',
    client_email:
      'bluemind-crm-speech@bluemind-d6c37.iam.gserviceaccount.com',
    client_id: '112124340792204539220',
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url:
      'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url:
      'https://www.googleapis.com/robot/v1/metadata/x509/bluemind-crm-speech%40bluemind-d6c37.iam.gserviceaccount.com',
    universe_domain: 'googleapis.com',
  },
});

io.on("connection", (socket) => {
  let recognizeStream = null;
  console.log("** a user connected - " + socket.id + " **\n");

  socket.on("disconnect", () => {
    console.log("** user disconnected ** \n");
  });

  socket.on("send_message", (message) => {
    console.log("message: " + message);
    setTimeout(() => {
      io.emit("receive_message", "got this message" + message);
    }, 1000);
  });

  socket.on("startGoogleCloudStream", function (data) {
    startRecognitionStream(this, data);
  });

  socket.on("endGoogleCloudStream", function () {
    console.log("** ending google cloud stream **\n");
    stopRecognitionStream();
  });

  socket.on("send_audio_data", async (audioData) => {
    io.emit("receive_message", "Got audio data");
    if (recognizeStream !== null) {
      try {
        recognizeStream.write(audioData.audio);
      } catch (err) {
        console.log("Error calling google api " + err);
      }
    } else {
      console.log("RecognizeStream is null");
    }
  });

  function startRecognitionStream(client) {
    console.log("* StartRecognitionStream\n");
    try {
      recognizeStream = speechClient
        .streamingRecognize(request)
        .on("error", console.error)
        .on("data", (data) => {
          const result = data.results[0];
          const isFinal = result.isFinal;

          const transcription = data.results
            .map((result) => result.alternatives[0].transcript)
            .join("\n");

          console.log(`Transcription: `, transcription);

          client.emit("receive_audio_text", {
            text: transcription,
            isFinal: isFinal,
          });

          // if end of utterance, let's restart stream
          // this is a small hack to keep restarting the stream on the server and keep the connection with Google api
          // Google api disconects the stream every five minutes
          if (data.results[0] && data.results[0].isFinal) {
            stopRecognitionStream();
            startRecognitionStream(client);
            console.log("restarted stream serverside");
          }
        });
    } catch (err) {
      console.error("Error streaming google api " + err);
    }
  }

  function stopRecognitionStream() {
    if (recognizeStream) {
      console.log("* StopRecognitionStream \n");
      recognizeStream.end();
    }
    recognizeStream = null;
  }
});

server.listen(8001, () => {
  console.log("WebSocket server listening on port 8001.");
});

// =========================== GOOGLE CLOUD SETTINGS ================================ //

// The encoding of the audio file, e.g. 'LINEAR16'
// The sample rate of the audio file in hertz, e.g. 16000
// The BCP-47 language code to use, e.g. 'en-US'
const encoding = "LINEAR16";
const sampleRateHertz = 16000;
const languageCode = "ko-KR"; //en-US
const alternativeLanguageCodes = ["en-US", "ko-KR"];

const request = {
  config: {
    encoding: encoding,
    sampleRateHertz: sampleRateHertz,
    languageCode: "en-US",
    //alternativeLanguageCodes: alternativeLanguageCodes,
    enableWordTimeOffsets: true,
    enableAutomaticPunctuation: true,
    enableWordConfidence: true,
    enableSpeakerDiarization: true,
    //diarizationSpeakerCount: 2,
    //model: "video",
    model: "command_and_search",
    //model: "default",
    useEnhanced: true,
  },
  interimResults: true,
};
