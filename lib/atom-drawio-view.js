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

    // Create root element
    this.element = document.createElement('iframe');

    this.element.classList.add('atom-drawio');
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
      this.element.src = `${__dirname}/../drawio/index.html?${qs}`;
      // console.log('src:', this.element.src);
    }
    this.element.width = '100%';
    this.element.height = '100%';
  }

  handleEvent(ev) {
    if (event.type !== 'message') {
      return;
    }
    const data = JSON.parse(ev.data || '{}');
    if (this.element.contentWindow != ev.source) {
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

        this.element.contentWindow.postMessage(
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
    if (!this.element.contentWindow) {
      return;
    }
    this.element.contentWindow.postMessage(
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
    return !!this.element.contentWindow;
  }

  save() {
    console.log('AtomDrawioView save');
    this.noSaveExitDialog();
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
