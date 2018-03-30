'use babel';

import AtomDrawioView from './atom-drawio-view';
import { CompositeDisposable } from 'atom';

import path from 'path';
import fs from 'fs';

export default {

  atomDrawioView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    console.log('in activate');
    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'atom-drawio:toggle': () => this.toggle()
    }));

    atom.workspace.addOpener((uri) => {
      console.log('drawio opener uri:', uri, 'ext:', path.extname(uri));
      if (path.extname(uri) === '.xml') {
        const xml = fs.readFileSync(uri);
        if (xml.lastIndexOf('<mxfile ', 0) === 0) {
          console.log('match drawio');
          this.atomDrawioView = new AtomDrawioView({URI: uri});
          return this.atomDrawioView;
        }
      }
    });
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.atomDrawioView.destroy();
  },

  serialize() {
    return {
      // atomDrawioViewState: this.atomDrawioView.serialize()
    };
  },

};
