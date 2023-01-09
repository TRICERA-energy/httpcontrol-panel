# MQTT Panel

## Index

- [Description](#description)
- [Installation](#installation)
- [Settings](#settings)
   - [Connection](#connection)
   - [Groups](#groups)
   - [Controls](#controls)
      - [Button](#button)
      - [Switch](#switch)
      - [Text Input](#text-input)
      - [Slider](#slider)
- [Panel](#panel)
- [Development](#development)

## Description

This panel plugin allows to post data to a HTTP grafana backend API. 
It is possible to define multiple groups with 
multiple controllers of type [Button](#button), [Switch](#switch),
[Text Input](#text-input) and [Slider](#slider).

## Installation

- Via the release binary:
   
   Download the latest [Release](https://github.com/TRICERA-energy/http-control-panel/releases) and unzip it into the grafana plugin folder.

- Build your own binaries:

   You can build the binaries by yourself. 
   1. Clone this repository to your grafana plugin folder.
   2. Run `yarn` (Make sure you have nodejs and yarn installed)
   3. Run `yarn build`

- Load the plugin directly into a grafana container

   ```
   docker run -d -p 3000:3000 -e "GF_INSTALL_PLUGINS=https://github.com/TRICERA-energy/http-control-panel/releases/download/v1.0.0/triceraenergy-httpcontrol-panel-1.0.0.zip;httpcontrol-panel" --name=grafana grafana/grafana
   ```



## Settings
### Connection

![](/doc/connection.png)

**Note:** The password is hashed with the home directory to avoid clear password in the panel data. It does not make the panel more safety but avoids to have a clear password.

### Groups

A new group can be added via the `Add Group` button.

![](/doc/group.png)

**Note:** You can't reorder the controls currently in the panel or group settings section. Make sure to add the controls in the order you want.

### Controls

A new control can be added via the `Add Control` button. Beside the *Name*, *Color* and *Publish Topic* each control type has specific settings.

#### Button

The button sends the given *Value* to the given *Publish Topic*. For more customization a icon provided by grafana can be selected.

![](/doc/button.png)

#### Switch

The switch sends the given *Value On* on true and then given *Value Off* on false. Switches also listen to the given *Subscribe Topic* and read there state from given *Listen Path*. This path should be a valid json path and the value should be boolean convertable.

Let's asume with get the following message from the given *Subscribe Topic*:

```json
{
   "switch": true,
   "array": [true, false, false, true]
}
```

With a *Listen Path* of `switch` the state would be true.
With a *Listen Path* of `array[1]` the state would be false.

![](/doc/switch.png)

#### Text Input

Text input acts like a [Button](#button) control with the difference that you insert the message directly in the panel instead in the settings. This allows to send different messages via one button.

![](/doc/text-input.png)

#### Slider

With the slider you can control a number range between *To* and *From* value. Like the [Switch](#switch) it listen to the given *Subscribe Topic* via a valid json path. The value should be number convertable.

![](/doc/slider.png)

## Panel 

By default the panel contains one `Error` tab which shows the last 200 errors occuried within the panel and a label to show if the panel is still connected to the mqtt broker.

![](/doc/panel.png)

## Development

1. Install dependencies

   ```bash
   yarn install
   ```

2. Build plugin in development mode or run in watch mode

   ```bash
   yarn dev

   # or

   yarn watch
   ```

3. Build plugin in production mode

   ```bash
   yarn build
   ```

4. Run the tests (using Jest)

   ```bash
   # Runs the tests and watches for changes
   yarn test

   # Exists after running all the tests
   yarn lint:ci
   ```

5. Spin up a Grafana instance and run the plugin inside it (using Docker)

   ```bash
   yarn server
   ```

6. Run the E2E tests (using Cypress)

   ```bash
   # Spin up a Grafana instance first that we tests against
   yarn server

   # Start the tests
   yarn e2e
   ```

7. Run the linter

   ```bash
   yarn lint

   # or

   yarn lint:fix
   ```
