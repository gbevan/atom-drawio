'use babel';

import fs from 'fs';
import path from 'path';
import querystring from 'querystring';

export default class AtomDrawioView {

  constructor(props) {
    console.log('AtomDrawioView constructor ********************************************')
    this.props = props || {};
    console.log('AtomDrawioView props:', this.props);
    this.filename = '';
    this.dirname = '';
    let uri;
    if (this.props.URI) {
      this.filename = path.basename(this.props.URI);
      uri = `file://${this.props.URI}`;
      console.log('uri:', uri);
      console.log('filename:', this.filename);

      this.dirname = path.dirname(this.props.URI);
    }
    this.title = this.filename || 'draw.io';

    // save png file name for export
    const file = this.props.URI;
    this.pngFile = file.substr(0, file.lastIndexOf('.')) + '.png';

    // Create root element
    this.element = document.createElement('div');
    this.element.classList.add('atom-drawio');

    this.buttonBar = document.createElement('div');
    this.buttonBar.classList.add('atom-drawio-buttonbar');
    this.element.appendChild(this.buttonBar);

    this.exportButton = document.createElement('button')
    this.exportButton.classList.add('atom-drawio-button');
    this.exportButton.appendChild(document.createTextNode(`Export to ${this.pngFile}`));
    this.buttonBar.appendChild(this.exportButton);
    this.exportButton.onclick = () => {
      console.log('button clicked');
      this.drawio.contentWindow.postMessage(
        JSON.stringify({
          action: 'export',
          title: this.filename,
          format: 'png'
        }),
        '*'
      );
    }

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
        browser: 0
        // save: 'local'
      })
      window.addEventListener('message', this);
      this.drawio.src = `${__dirname}/../drawio/src/main/webapp/index.html?${qs}`;
      // console.log('src:', this.element.src);
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
    // console.log('handleEvent filtered by source ev:', ev);

    if (data.event === 'init') {
      console.log('responding to init event');

      // Prevent tab close outside of drawio
      const pane = atom.workspace.getActivePane();
      console.log('AtomDrawioView init pane:', pane);
      if (!pane._promptToSaveItem) {
        pane._promptToSaveItem = pane.promptToSaveItem;
      }
      pane.promptToSaveItem = (item, options) => {
        console.log('in pane promptToSaveItem item:', item);
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

    if (data.event === 'save') {
      fs.writeFile(this.props.URI, data.xml, (err) => {
        if (err) {
          console.error('drawio save err:', err);
        }
      })
    }

    if (data.event === 'export') {
      console.log('export data:', data);

      // data.data = data:image/png;base64,iVBORw...base64_of_image...
      const pngb64 = data.data.replace(/^data:image\/png;base64,/, '');
      // console.log('pngb64:', pngb64);
      // const png = atob(pngb64)
      // console.log('png:', png);

      const file = this.props.URI;
      const pngFile = file.substr(0, file.lastIndexOf('.')) + '.png';
      console.log('pngFile:', pngFile);

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
      })
    }

    if (data.event === 'exit') {
      console.log('exit');
      window.removeEventListener('message', this);
      this.element.remove();
      const pane = atom.workspace.getActivePane();
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
