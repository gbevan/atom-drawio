'use babel';

import AtomDrawioView from './atom-drawio-view';
import AtomDrawioNewFile from './atom-drawio-newfile';
import { CompositeDisposable } from 'atom';

import path from 'path';
import fs from 'fs';

export default {

  atomDrawioNewFile: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
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
          console.error(e);
        }
        if (xml.lastIndexOf('<mxfile ', 0) === 0) {
          console.log('match drawio');
          const atomDrawioView = new AtomDrawioView({
            URI: uri,
            parent: this
          });
          return atomDrawioView;
        }
      }
    });
  },

  deactivate() {
    console.log('AtomDrawio deactivate()');
    this.subscriptions.dispose();
  },

  serialize() {
    return {
      // atomDrawioViewState: this.atomDrawioView.serialize()
    };
  },

  newDiagram() {
    new AtomDrawioNewFile()
    .then((newfile) => {
      this.atomDrawioNewFile = newfile;
      this.atomDrawioNewFile.open();
    })

  }
};
