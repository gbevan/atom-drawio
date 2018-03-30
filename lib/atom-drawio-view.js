'use babel';

import path from 'path';

export default class AtomDrawioView {

  constructor(props) {
    console.log('AtomDrawioView props:', props);
    const filename = path.basename(props.URI);
    const uri = `file://${props.URI}`;
    console.log('uri:', uri);
    console.log('filename:', filename);
    this.title = filename || 'draw.io';

    // Create root element
    this.element = document.createElement('iframe');
    this.element.classList.add('atom-drawio');
    // this.element.src = `${__dirname}/../drawio/index.html?stealth=1&offline=1&od=0&gh=0&tr=0&local=1&storage=device&save=local&mode=device&cors=file%3F.*&title=${filename}&url=${uri}`;
    this.element.src = `${__dirname}/../drawio/index.html?browser=0&db=0&gapi=0&math=0&picker=0&analytics=0&od=0&gh=0&tr=0&local=1&storage=device&save=local&mode=device&cors=file%3F.*&title=${filename}&url=${uri}`;
    this.element.width = '100%';
    this.element.height = '100%';
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
    return `Draw.io: ${this.title}`;
  }
}
