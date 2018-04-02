# Package to provide embedded Draw.io diagram editting support in Atom

Create and edit your draw.io diagrams directly from within the Atom editor.

This is an early release - please feel free to contribute and improve this
package.

Note:
Ideally, draw.io (mxfiles) should be able to be rendered when referenced
from Markdown files as images.  Also, support needed to render in Github markdown
and gh-pages/jekyll.

## Screenshot
![Screenshot](screenshot.jpg)
Enjoy :-)

## License

The atom-drawio project is released under the [MIT License](LICENSE).

Draw.io itself is released by jpgraph under the [Apache-2.0 License](https://github.com/jgraph/drawio/blob/master/LICENSE)

## Git Subtree Draw.io repo
### Add subtree
```bash
git subtree add --prefix drawio https://github.com/gbevan/drawio.git D20180402_support_atom --squash
```
### Pull subtree
```bash
git subtree pull --prefix drawio https://github.com/gbevan/drawio.git D20180402_support_atom --squash
```
