# Standard Ranklist Renderer

Just a srk renderer.

## Intro

It's a web renderer of srk under development. 

It has implemented all the features at srk 0.2.x except the automatic sorting.

We don’t recommend using it in a production environment unless you just want to build a single page to display your ranklist. Of course, you can also use this project as a test tool for your srk crawler. For how to test your crawler, please refer to the "Crawler Test" section below.

TODO
- Build as React component (can be imported in other projects) and refactor plugin
- Vue.js support

Technologies
- Node.js
- TypeScript
- React (Create-React-App)


## How to Develop

Environment: Node.js

Run:

```
git submodule init && git submodule update
npm i
npm start
```

Open url in your browser: `http://localhost:3000`

## How to Build

Environment: Node.js

Steps:

1. (Optional) Modify production config url in `src/App.tsx`
2. Run: `npm run build`

It will output to `build/`.

You can place your production config json in build dir (by default) or another dir.

Production config fields:

```
srkRefreshInterval: number; // srk refresh intervel (ms)
srkUrl: string; // srk fetch url
scrollSolutionRefreshInterval?: number; // scroll solution plugin refresh interval (ms)
scrollSolutionUrl?: string; // scroll solution data fetch url
```

See the section about [CRA's deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

## Crawler Test

To use this project as a test and preview tool for your srk crawler, you should start the development according to the "How to Develop" section above, and then output the generated srk json file by your crawler to `src/demo.json`.

Open `http://localhost:3000` to view ranklist. It will automatically respond to data changes.

## Reference

- [srk](https://github.com/algoux/standard-ranklist)
