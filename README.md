
# CustomLinks SPFx Web Part

A SharePoint Framework (SPFx) web part that allows users to configure and display custom links on a SharePoint page. Built using React and SPFx v1.18.2, this web part supports modern SharePoint sites and offers property pane customization using PnP controls.

---

## 📁 Project Structure

```
custom-link-webpart/
├── config/                    # SPFx config files
├── sharepoint/               # Deployment package (.sppkg)
├── src/                      # Source code (React + TypeScript)
│   └── webparts/
│       └── customLinks/      # Main web part implementation
├── gulpfile.js               # Gulp tasks
├── package.json              # Project metadata & dependencies
├── README.md                 # Project documentation
└── tsconfig.json             # TypeScript config
```

---

## 🚀 Features

- Add and manage custom links via property pane.
- Icon/image support for each link.
- Support for modern SharePoint pages.
- Built with React 17 and SPFx 1.18.2.
- Uses PnP SPFx reusable controls and property pane components.

---

## 🧰 Tech Stack

| Tool/Library                          | Version     |
|--------------------------------------|-------------|
| **SPFx (SharePoint Framework)**      | 1.18.2      |
| **React**                            | 17.0.1      |
| **TypeScript**                       | 4.7.4       |
| **PnP JS (@pnp/sp)**                 | ^1.3.11     |
| **PnP SPFx Controls**                | ~3.11.0     |
| **Node.js**                          | 16.20.2     |
| **Gulp**                             | 4.0.2       |

---

## ⚙️ Setup Instructions

### 1. 📦 Install Node.js

Make sure you have Node.js **v16.20.2** installed (other supported versions: `>=16.13.0 <17.0.0 || >=18.17.1 <19.0.0`).

You can install it via [Node.js official site](https://nodejs.org/) or use Volta:

```bash
volta install node@16.20.2
```

---

### 2. 📁 Clone the repository

```bash
git clone https://samarthtrivedi.redant@bitbucket.org/ansul-atlassian/custom-links.git
cd custom-link-webpart
```

---

### 3. 🛠 Install dependencies

```bash
npm install
```

> This will also run `npx npm-force-resolutions` to apply package resolutions.

---

### 4. 💻 Run the project locally (Workbench)

#### Build and launch the local dev server

```bash
gulp clean
gulp build
gulp serve
```

This will start a local development server and open a browser window. If not, visit:

```
https://localhost:4321/temp/workbench.html
```

> This local workbench simulates the SharePoint environment for development and testing without deploying to SharePoint Online.

---

### 5. 🌐 Run on SharePoint Online Workbench

1. Open your `config/serve.json` and make sure the `initialPage` is set correctly:
```json
{
  "initialPage": "https://{your-tenant}.sharepoint.com/sites/{site-name}/_layouts/15/workbench.aspx"
}
```

2. Run:

```bash
gulp build
gulp serve
```

3. Navigate to the specified SharePoint Online workbench URL in your browser.

---

### 6. 📦 Bundle for production

```bash
gulp bundle --ship
```

---

### 7. 📁 Package the solution

```bash
gulp package-solution --ship
```

> The `.sppkg` file will be created at:
> ```
> ./sharepoint/solution/custom-link-webpart.sppkg
> ```

---

### 8. 🚀 Deploy to App Catalog

1. Go to your [SharePoint App Catalog](https://{your-tenant}.sharepoint.com/sites/apps).
2. Upload `custom-link-webpart.sppkg` file.
3. Click "Deploy" when prompted.

---

## 🧪 Test in SharePoint

1. Add the **CustomLinks** web part to any modern SharePoint page.
2. Configure it using the property pane (add titles, links, icons).
3. Save and publish the page.

---

## 🔍 Linting & Testing

Run linting:
```bash
npm run lint
```

Run unit tests:
```bash
npm test
```

---

## 👨‍💻 Author

Developed by Samarth Trivedi  
For any queries, reach out at [samarth2004trivedi@gmail.com]

---
