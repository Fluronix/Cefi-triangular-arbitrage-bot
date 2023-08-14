const fs = require("fs");
const WebSocketClient = require("websocket").client;
const moment = require("moment");

//READ FILE-----------------------------------------------------------------
function openFile(fPath) {
  try {
    const data = fs.readFileSync(fPath, "utf8");
    return data;
  } catch (err) {
    return [];
  }
}

//Write File----------------------------------------------------------------
function saveFile(fPath, fileToSave) {
  try {
    fs.writeFileSync(fPath, fileToSave);
    return true;
  } catch (error) {
    return error;
  }
}
// wait until the specified seconds-------------------------------------------
function sleep(second) {
  const waitTill = new Date(new Date().getTime() + second * 1000);
  while (waitTill > new Date()) {}
}

const client = new WebSocketClient();
client.on("connectFailed", function (error) {
  console.log("Connect Error: " + error.toString());
});

client.on("connect", function (connection) {
  console.log("WebSocket Client Connected");
  connection.on("error", function (error) {
    console.log("Connection Error: " + error.toString());
  });

  connection.on("close", function () {
    console.log("echo-protocol Connection Closed");
    stream();
  });

  connection.on("message", function (message) {
    if (message.type === "utf8") {
      const wss_message = JSON.parse(message.utf8Data);
      let mes_time = moment();
      mes_time = mes_time.format("YYYY-MM-DD HH:mm:ss");
      // format date so that python can understand_____________________________
      /*const dd = String(mes_time.getDate()).padStart(2, "0");
      const mm = String(mes_time.getMonth() + 1).padStart(2, "0"); //January is 0!
      const yyyy = mes_time.getFullYear();
      const time = mes_time.toLocaleTimeString();
      const datetime =
        yyyy + "-" + mm + "-" + dd + " " + time.replace(" PM", "");*/
      //________________________________________________________________________

      const new_wss_message = { dateTime: mes_time, tickers: wss_message };
      // save message
      saveFile("../binance_wss_tickers.json", JSON.stringify(new_wss_message));
    }
  });
});

const stream = function () {
  client.connect("wss://stream.binance.com:9443/ws/!ticker@arr");
};
stream();
