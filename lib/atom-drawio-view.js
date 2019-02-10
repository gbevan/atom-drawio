'use babel';

import fs from 'fs';
import path from 'path';
import querystring from 'querystring';
import _ from 'lodash';

export default class AtomDrawioView {

  constructor(props) {
    this.props = props || {};
    this.filename = '';
    this.dirname = '';
    let uri;
    if (this.props.URI) {
      this.filename = path.basename(this.props.URI);
      uri = `file://${this.props.URI}`;
      this.dirname = path.dirname(this.props.URI);
    }
    this.title = this.filename || 'draw.io';

    // save png file name for export
    const file = this.props.URI;
    this.pngFile = file.substr(0, file.lastIndexOf('.')) + '.png';
    this.svgFile = file.substr(0, file.lastIndexOf('.')) + '.svg';

    // Create root element
    this.element = document.createElement('div');
    this.element.classList.add('atom-drawio');

    if (atom.config.get("atom-drawio.showExportButtons")) {
      this.buttonBar = document.createElement('div');
      this.buttonBar.classList.add('atom-drawio-buttonbar');
      this.element.appendChild(this.buttonBar);

      this.exportButton = document.createElement('button')
      this.exportButton.classList.add('atom-drawio-button');
      this.exportButton.appendChild(document.createTextNode(`Export to ${this.pngFile}`));
      this.buttonBar.appendChild(this.exportButton);
      this.exportButton.onclick = () => {
        this.drawio.contentWindow.postMessage(
          JSON.stringify({
            action: 'export',
            title: this.filename,
            format: 'png'
          }),
          '*'
        );
      }

      this.exportSvgButton = document.createElement('button')
      this.exportSvgButton.classList.add('atom-drawio-button');
      this.exportSvgButton.appendChild(document.createTextNode(`Export to ${this.svgFile}`));
      this.buttonBar.appendChild(this.exportSvgButton);
      this.exportSvgButton.onclick = () => {
        this.drawio.contentWindow.postMessage(
          JSON.stringify({
            action: 'export',
            title: this.filename,
            format: 'xmlsvg'
          }),
          '*'
        );
      }
    } // showExportButtons

    // drawio iframe
    this.drawio = document.createElement('iframe');
    this.element.appendChild(this.drawio);

    if (uri) {
      const qs = querystring.stringify({
        offline: 1,
        // cors: 'file://.*',
        // title: `${props.URI}`,
        title: `${this.filename}`,
        // url: `${uri}`,
        splash: 0,

        // client: 1,
        embed: 1,
        proto: 'json',
        // stealth: 1,

        // mode: 'device',
        // local: 1,
        // storage: 'device',
        browser: 0,
        ui: atom.config.get("atom-drawio.theme")
        // save: 'local'
      })
      window.addEventListener('message', this);
      this.drawio.src = `${__dirname}/../drawio/src/main/webapp/index.html?${qs}`;
    }
    this.drawio.width = '100%';
    this.drawio.height = '100%';
  }

  handleEvent(ev) {
    if (event.type !== 'message') {
      return;
    }
    const data = JSON.parse(ev.data || '{}');
    if (this.drawio.contentWindow != ev.source) {
      return;
    }

    if (data.event === 'init') {
      // Prevent tab close outside of drawio
      const pane = atom.workspace.getActivePane();
      if (!pane._promptToSaveItem) {
        pane._promptToSaveItem = pane.promptToSaveItem;
      }
      pane.promptToSaveItem = (item, options) => {
        if (item.constructor.name === 'AtomDrawioView') {
          item.noSaveExitDialog();
          return false;
        }

        return pane._promptToSaveItem(item, options);
      };

      fs.readFile(this.props.URI, (err, xml) => {
        if (err) {
          console.error(err);
          return;
        }
        xml = xml.toString();
        this.drawio.contentWindow.postMessage(
          JSON.stringify({
            action: 'load',
            title: this.filename,
            xml,
            autosave: 0
          }),
          '*'
        );
      });
    }

    // save from clicking save in drawio
    if (data.event === 'save') {
      const ext = path.extname(this.props.URI);
      if (ext === '.svg') {
        // Get SVG from drawio to save (returns as atomSVGRes)
        data.title = this.props.URI;
        data.action = 'atomSVG';
        data.event = '';
        this.drawio.contentWindow.postMessage(
          JSON.stringify(data),
          '*'
        );
      } else {
        fs.writeFile(this.props.URI, data.xml, (err) => {
          if (err) {
            console.error('drawio save err:', err);
          }
        });
      }
    }
    if (data.event === 'atomSVGRes') {
      fs.writeFile(data.title, data.svg, (err) => {
        if (err) {
          console.error('drawio save err:', err);
        }
      });
    }

    if (data.event === 'export') {
      const file = this.props.URI;

      if (data.format === 'png') {
        const pngb64 = data.data.replace(/^data:image\/png;base64,/, '');
        const pngFile = file.substr(0, file.lastIndexOf('.')) + '.png';

        // TODO: prompt to overwrite
        // fs.stat(pngFile, (err, stats) => {
        //   if (err) {
        //     console.error(err);
        //     return;
        //   }
        // });

        fs.writeFile(pngFile, pngb64, 'base64', (err) => {
          if (err) {
            console.error('drawio export err:', err);
          }
        });
      } else if (data.format === 'svg') {
        const svgFile = file.substr(0, file.lastIndexOf('.')) + '.svg';
        console.log('svgFile:', svgFile);

        // TODO: prompt to overwrite
        // fs.stat(pngFile, (err, stats) => {
        //   if (err) {
        //     console.error(err);
        //     return;
        //   }
        // });

        // Get SVG from drawio to save (returns as atomSVGRes)
        data.title = svgFile;
        data.action = 'atomSVG';
        data.event = '';
        this.drawio.contentWindow.postMessage(
          JSON.stringify(data),
          '*'
        );
      }
    }

    if (data.event === 'exit') {
      console.log('exit');
      window.removeEventListener('message', this);
      this.element.remove();
      const pane = atom.workspace.getActivePane();
      console.log('Active pane:', pane);
      pane.destroyActiveItem();
      console.log('exit after parent deactivate - window:', window);
    }
  }

  noSaveExitDialog() {
    if (!this.drawio.contentWindow) {
      return;
    }
    this.drawio.contentWindow.postMessage(
      JSON.stringify({
        action: 'dialog',
        titleKey: 'error',
        message: 'Feature Not Yet Implemented! Please use the save/exit buttons within the drawio window',
        buttonKey: 'ok'
      }),
      '*'
    );
  }

  shouldPromptToSave(options) {
    console.log('shouldPromptToSave options:', options);
    return !!this.drawio.contentWindow;
  }

  save() {
    console.log('AtomDrawioView save');
    // this.noSaveExitDialog();
    // if (!this.element.contentWindow) {
    //   return;
    // }
    this.drawio.contentWindow.postMessage(
      JSON.stringify({
        action: 'save'
      }),
      '*'
    );
  }

  saveAs() {
    console.log('AtomDrawioView saveAs');
    this.noSaveExitDialog();
  }

  // Returns an object that can be retrieved when package is activated
  serialize() {}

  // Tear down any state and detach
  destroy() {
    console.log('AtomDrawioView destroy()');
    this.noSaveExitDialog();
  }

  getElement() {
    return this.element;
  }

  getTitle() {
    return this.title;
  }

  getUri() {
    return this.props.URI;
  }

  getPath () {
    return this.dirname;
  }
}
