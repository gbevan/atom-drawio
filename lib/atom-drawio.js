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

    // Register commands
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'atom-drawio:newDiagram': () => this.newDiagram()
    }));

    atom.workspace.addOpener((uri) => {
      console.log('drawio opener uri:', uri, 'ext:', path.extname(uri));
      if (path.extname(uri) === '.xml') {
        let xml = ''
        try {
          xml = fs.readFileSync(uri);
        } catch(e) {

        }
        if (xml.lastIndexOf('<mxfile ', 0) === 0 || path.basename(uri) === 'default_drawio.xml') {
          console.log('match drawio');
          this.atomDrawioView = new AtomDrawioView({URI: path.basename(uri) !== 'default_drawio.xml' ? uri : ''});
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

  newDiagram() {
    atom.workspace.open('default_drawio.xml');
  }

};
