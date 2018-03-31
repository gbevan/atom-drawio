'use babel'

import { Point, TextEditor } from 'atom';
import path from 'path';
import fs from 'fs';

export default class AtomDrawioNewFile {
  constructor(props) {
    console.log('AtomDrawioNewFile props:', props);

    return new Promise((resolve, reject) => {
      const activeItem = atom.workspace.getActivePaneItem();
      console.log('Active item:', activeItem);

      let selectedPath = activeItem.selectedPath;
      fs.stat(selectedPath, (err, stats) => {
        if (stats.isFile()) {
          selectedPath = path.dirname(selectedPath);
        }
        console.log('selectedPath:', selectedPath);

        this.element = document.createElement('div');
        this.element.classList.add('atom-drawio');

        // Input new file name
        this.miniEditor = new TextEditor({ mini: true });
        this.miniEditor.element.addEventListener('blur', this.close.bind(this));
        this.miniEditor.setPlaceholderText('Enter new drawio file name, e.g. "diagram.xml"');
        this.miniEditor.setText(`${selectedPath}${path.sep}newdiagram.xml`);
        this.element.appendChild(this.miniEditor.element);

        this.panel = atom.workspace.addModalPanel({
          item: this,
          visible: false,
        });

        atom.commands.add(this.miniEditor.element, 'core:confirm', () => {
          this.confirm();
        });
        atom.commands.add(this.miniEditor.element, 'core:cancel', () => {
          this.close();
        });

        resolve(this);
      });
    });
  }

  storeFocusedElement() {
    this.previouslyFocusedElement = document.activeElement;
    return this.previouslyFocusedElement;
  }

  restoreFocus() {
    if (this.previouslyFocusedElement && this.previouslyFocusedElement.parentElement) {
      return this.previouslyFocusedElement.focus();
    }
    atom.views.getView(atom.workspace).focus();
  }

  open() {
    if (this.panel.isVisible()) return;
    this.storeFocusedElement();
    this.panel.show();
    // this.message.textContent = "Enter 'man' arguments here, e.g. 'ls' or '5 crontab'";
    this.miniEditor.element.focus();
  }

  close() {
    console.log('close()');
    if (! this.panel.isVisible()) return;
    this.miniEditor.setText('');
    this.panel.hide();
    if (this.miniEditor.element.hasFocus()) {
      this.restoreFocus();
    }
  }

  confirm() {
    const file = this.miniEditor.getText();
    this.close();

    // check if file already exists
    fs.stat(file, (err, stats) => {
      console.log('file:', file, 'stats:', stats);
      if (!stats) {
         // create empty mxfile
        fs.writeFile(file, `<mxfile userAgent="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Atom/1.24.1 Chrome/56.0.2924.87 Electron/1.6.16 Safari/537.36" version="8.5.0" editor="www.draw.io" type="device"><diagram id="dbcdc022-8115-a1c9-aecf-92c7b94d01f6" name="Page-1">dZHBEoIgEIafhrvBVHo2q0snD51JEJmQdRBH6+nTkIyxODDLt//uDwsiaT2cDG2qCzCuEI7YgMgBYYyT7bhP4OHAJsKxI8JINrMF5PLJvXCmnWS8DYQWQFnZhLAArXlhA0aNgT6UlaBC14YKvgJ5QdWaXiWzlaMx3i/8zKWovPNml7jMjRZ3YaDTsx/CpHwvl66p7zU/tK0og/4LkQyR1ABYF9VDytU0Wz82V3f8k/3c23BtfxSMwdJ7PAQfSLIX</diagram></mxfile>`, (err) => {
          atom.workspace.open(file);
        });
      } else {
        atom.workspace.open(file);
      }
    })
  }

  // Returns an object that can be retrieved when package is activated
  serialize() {}

  // Tear down any state and detach
  destroy() {
    this.element.remove();
  }

  getElement() {
    return this.element;
  }

  getTitle() {
    return `Draw.io: new file`;
  }
}
