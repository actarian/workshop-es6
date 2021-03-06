# workshop-es6

> [Slides](https://docs.google.com/presentation/d/1chyAlUxyP6NFxptSf3ncyYczI1GFUw65ZxF-uiddwWU/edit?usp=sharing)  
> [Demo](https://actarian.github.io/workshop-es6/)

## Requirements

### [NodeJs](https://nodejs.org/it/)
```
node.js -v
```
___

### [Npm](https://www.npmjs.com/)
```
npm -v
```
___
### Updating Npm on Mac
```
npm install npm@latest -g
```
___
### Updating Npm on Windows
[npm-windows-upgrade](https://www.npmjs.com/package/npm-windows-upgrade) 
___

### [Gulp CLI](https://github.com/angular/angular-cli) version 4.0.0
```
npm install gulp-cli -g
```
___

### Install packages
```
npm install
```
___

### Build, Serve & Watch 
```
gulp
```

___

### Build Only
```
gulp build
```
___

### Build & Watch 
```
gulp start
```
___

### Build Js Only
```
gulp buildJs
```
___

### Build Js & Watch 
```
gulp startJs
```
___

### Build Css Only
```
gulp buildCss
```
___

### Build Css & Watch 
```
gulp startCss
```
___

### Build Specific Target
```
gulp build --target dist
```
___

## Configuration

You can configure building targets, compilers and bundlers with an easy json configuration file.  

As in the example [gulpfile-config.json](https://github.com/actarian/workshop-es6/blob/master/gulpfile-config.json)

___

## gulpfile-config.json

> gulpfile-config.json

```json
{
	"targets": {
		"browser": {
			"compile": [
        {
          "input": "src/*.html",
          "output": "docs/",
          "minify": true
        }, {
          "input": "src/css/main.scss",
          "output": "docs/css/main.css",
          "minify": true
        }, {
          "input": "src/css/main-cssvars.scss",
          "output": "docs/css/main-cssvars.css",
          "minify": true
        }, {
          "input": "src/js/rxcomp/main.js",
          "output": {
            "file": "docs/js/rxcomp/main.js",
            "format": "iife"
          },
          "globals": {
            "gsap": "gsap",
            "rxjs": "rxjs",
            "rxjs/operators": "rxjs.operators",
            "rxcomp": "rxcomp",
            "rxcomp-form": "rxcomp-form"
          },
          "external": ["gsap", "rxjs", "rxjs/operators", "rxcomp", "rxcomp-form"],
          "minify": true
        }, {
          "input": "src/js/typescript/main.ts",
          "output": {
            "file": "docs/js/typescript/main.js",
            "format": "iife"
          },
          "globals": {
            "gsap": "gsap",
            "rxjs": "rxjs",
            "rxjs/operators": "rxjs.operators"
          },
          "external": ["gsap", "rxjs", "rxjs/operators"],
          "minify": true
        }, {
          "input": "src/js/vanilla/main.js",
          "output": {
            "file": "docs/js/vanilla/main.js",
            "format": "iife"
          },
          "globals": {
            "gsap": "gsap",
            "rxjs": "rxjs",
            "rxjs/operators": "rxjs.operators"
          },
          "external": ["gsap", "rxjs", "rxjs/operators"],
          "minify": true
        }
      ],
			"bundle": [
        {
          "input": [
            "node_modules/swiper/css/swiper.css"
          ],
          "output": "docs/css/vendors.css",
          "minify": true
        }, {
          "input": [
            "node_modules/rxjs/bundles/rxjs.umd.js",
            "node_modules/rxcomp/dist/rxcomp.js",
            "node_modules/rxcomp-form/dist/rxcomp-form.js",
            "node_modules/swiper/js/swiper.js",
            "node_modules/gsap/dist/EasePack.js",
            "node_modules/gsap/dist/gsap.js"
          ],
          "output": "docs/js/vendors.js",
          "minify": true
        }
      ],
			"copy": [
        {
          "input": [
            "node_modules/@fortawesome/fontawesome-free/**/*.*"
          ],
          "output": "docs/fonts/fontawesome/"
        }
      ]
		},
		"dist": {
			"compile": [{
				"input": "src/js/typescript/main.ts",
				"output": [{
					"file": "dist/amd/main.js",
					"format": "amd"
				}, {
					"file": "dist/cjs/",
					"format": "cjs"
				}, {
					"file": "dist/esm/",
					"format": "esm"
				}, {
					"file": "dist/system/main.js",
					"format": "system"
				}, {
					"file": "dist/iife/main.js",
					"format": "iife",
					"minify": true
				}, {
					"file": "dist/umd/main.js",
					"format": "umd",
					"minify": true
				}],
				"globals": {
					"rxjs": "rxjs",
					"rxjs/operators": "rxjs.operators"
				},
				"name": "main",
				"external": ["rxjs", "rxjs/operators"]
			}],
			"bundle": []
		}
	},
	"tfs": false,
	"server": {
		"root": "./docs",
		"path": "/workshop-es6/",
		"host": "localhost",
		"port": 9999,
		"log": false
	}
}
```
