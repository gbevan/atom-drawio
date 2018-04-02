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

## Developer Notes

### Git Subtree Draw.io repo
Note: Change branch names below as appropriate - update here for reference.

#### Add subtree
```bash
git subtree add --prefix drawio https://github.com/gbevan/drawio.git D20180402_support_atom --squash
```

#### Pull subtree
```bash
git subtree pull --prefix drawio https://github.com/gbevan/drawio.git D20180402_support_atom --squash
```

#### Prepare clone for pushing to drawio fork
```bash
git remote add gbevan-drawio git@github.com:gbevan/drawio.git
```

#### Push subtree to fork
To push changes back to the subtree fork:
```bash
git subtree push --prefix drawio gbevan-drawio D20180402_support_atom
```
and raise pull requests against the upstream repo as needed.

### Prepare Build
```bash
npm run-script build
```
This prepares the drawio build by running `ant all` in `drawio/etc/build` -
this the `*.min.js` files for drawio.

### Release to Atom
```bash
# for a patch release
apm publish patch

# for a minor release
apm publish minor

# for a major release
apm publish major
```
