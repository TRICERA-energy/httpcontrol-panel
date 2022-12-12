import { AES, enc } from "crypto-js";
import { connect, IClientOptions, MqttClient } from "mqtt";
import { homedir } from "os";
import { ConnectionOptions } from "types";
import { setError } from "./errorHandler";

export function connectMQTT (options: ConnectionOptions): MqttClient {
  // kill old client
  if (options.client.end) {
    options.client.end(true);
  }

  let optionsMqtt: IClientOptions = {};
  optionsMqtt.host = options.server;
  optionsMqtt.port = Number(options.port);
  optionsMqtt.protocol = options.protocol;

  if (options.user && options.password) {
    optionsMqtt.username = options.user;
    optionsMqtt.password = AES.decrypt(options.password, homedir()).toString(enc.Utf8);
  }

  let client = connect(optionsMqtt);
  client.subscribe(options.subscribe);

  client.on('error', (error: Error) => {
    setError({title: 'MQTT Error Event', error: error.toString()})
  })

  return client;
};
