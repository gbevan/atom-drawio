'use babel';

import AtomDrawioView from './atom-drawio-view';
import AtomDrawioNewFile from './atom-drawio-newfile';
import { CompositeDisposable } from 'atom';

import path from 'path';
import fs from 'fs';

const reSvgMx = /^\s*<svg .* content="&lt;mxfile /m;

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
      const ext = path.extname(uri);
      if (ext === '.xml') {
        let xml = ''
        try {
          xml = fs.readFileSync(uri).toString();
        } catch(e) {
          console.error(e);
        }
        if (xml.lastIndexOf('<mxfile ', 0) === 0) {
          const atomDrawioView = new AtomDrawioView({
            URI: uri,
            parent: this
          });
          return atomDrawioView;
        }
      } else if (ext === '.svg') {
        let svg = ''
        try {
          svg = fs.readFileSync(uri).toString();
        } catch(e) {
          console.error(e);
        }
        if (reSvgMx.test(svg)) {
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
