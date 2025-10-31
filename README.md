https://www.freecodecamp.org/news/how-to-create-and-publish-a-vue-component-library-update/
https://blog.logrocket.com/building-vue-3-component-library/


https://snyk.io/advisor/npm-package/cili

Install

# Globally
yarn global add bili
# Locally
yarn add bili --dev
If you prefer npm:

# Globally
npm i -g bili
# Locally
npm i -D bili
Usage
Bundle src/index.js with a single command:

bili
Then you will get ./dist/index.cjs.js. To generate in more formats, try:

bili --format cjs,es,umd,umd-min
Then you will get:

index.js            # UMD format
index.min.js        # Minified UMD format
index.min.js.map    # Sourcemaps for minified UMD format
index.cjs.js        # CommonJS format
index.es.js         # ES module format

https://developpaper.com/vue-js-build-your-first-package-and-publish-it-on-npm/
https://byegoist.medium.com/bundle-vue-library-with-bili-65de446365a8
https://www.telerik.com/blogs/vuejs-how-to-build-your-first-package-publish-it-on-npm


jorik2021A1_npm_pinedo@

javascript
https://livecodestream.dev/post/publish-your-first-node-library-using-npm/

npm install --save ku-button