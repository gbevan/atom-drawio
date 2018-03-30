'use babel';

import path from 'path';

export default class AtomDrawioView {

  constructor(props) {
    props = props || {};
    console.log('AtomDrawioView props:', props);
    let filename;
    let uri;
    if (props.URI) {
      filename = path.basename(props.URI);
      uri = `file://${props.URI}`;
      console.log('uri:', uri);
      console.log('filename:', filename);
    }
    this.title = filename || 'draw.io';

    // Create root element
    this.element = document.createElement('iframe');
    this.element.classList.add('atom-drawio');
    if (uri) {
      this.element.src = `${__dirname}/../drawio/index.html?browser=0&db=0&gapi=0&math=0&picker=0&analytics=0&od=0&gh=0&tr=0&local=1&storage=device&save=local&mode=device&cors=file%3F.*&title=${filename}&url=${uri}`;
    } else {
      console.log('create new');
      this.element.src = `${__dirname}/../drawio/index.html?browser=0&db=0&gapi=0&math=0&picker=0&analytics=0&od=0&gh=0&tr=0&local=1&storage=device&save=local&mode=device`;
    }
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
