# ✨ minisheet ✨

### Running

`docker-compose up minisheet`

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

Any changes you make to the files should reflect immediately without the need of a restart.

### Tests

`docker-compose run --remove-orphans test`

This will run the tests in the interactive watch mode.

We remove orphan containers here from prior test runs if you need to restart.

### Rebuilding

`docker-compose build` will rebuild the container. This should not be necessary unless you make changes to package.json etc.
