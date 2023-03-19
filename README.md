# OData Visualizer
<p float="left">
<img src="https://raw.githubusercontent.com/kevinbalboni/openui5-odata-visualizer/main/webapp/img/Logo_trasparente_piccolo_new.png" width="200" heigth="200">
<img src="https://raw.githubusercontent.com/kevinbalboni/openui5-odata-visualizer/main/webapp/img/Logo_trasparente_piccolo2.png" width="200" heigth="200">
</p>

A simple tool to explore V2 OData services

Try <a href="https://kevinbalboni.github.io/openui5-odata-visualizer/" target="_blank">Live Demo</a> 
[![MIT License](https://img.shields.io/badge/-read%20About%20CORS%20first-orange)](https://github.com/kevinbalboni/openui5-odata-visualizer/edit/main/README.md#about-cors)

## About CORS
Before using OData Visualizer visit this <a href="https://cors-anywhere.herokuapp.com/corsdemo" target="_blank">page</a> and click the "Request termporary access to the demo server" button.

When adding an OData service, prepend this string to your link: "https://cors-anywhere.herokuapp.com/corsdemo/"

#### Why this?

OData-Visualizer is a tool made only with front-end technologies, there is no server that can act as a proxy for OData calls.
This approach does not comply with the CORS policies of the major browsers.

## Roadmap

- [X] Write README.md information about CORS and how to deal with it
- [X] Refresh metadata create infinite loop
- [ ] Refresh metadata does not trigger a metadata call
- [X] Export all tables to CSV/Excel
- [X] Export metadata to file
- [ ] Controllare persistenza dei dati quando si cambia view (mantenere i dati in "Esplora Dati")
- [X] Credits page / with contact me button /website k-develop.it ecc...
- [ ] check Entity navigation cardinality (Example "* ... 0..1" ?!?!?!?!??!?!?!)
- [X] Count number of entities, functions, complex types
- [X] Basic authentication for OData Services
- [ ] Custom header for Odata Services
- [X] Function 
  - [X] Bounded
  - [X] Unbounded
- [X] Navigations
  - [X] Navigation from Function parameters to Complex Types (parseFileMessages)
  - [X] Navigation from Function Return type to Complex Types (parseFileMessages)
  - [X] Navigation from Function Return type to Entities (disable User)
  - [X] Navigation from Entity property to ComplexType (odata.org Supplier)
- [X] Complex Types support
- [ ] How to display field "Nullable" if missing 
- [ ] Data Browser with OData Client simulator 
  - [ ] GET
    - [X] Basic functionality
    - [ ] Where condition for complex type
    - [X] Where condition for navigation's properties
    - [ ] Length support (example: $filter=length(CompanyName) eq 19)
    - [ ] OR support 
    - [ ] () support
    - [ ] $inlinecount
  - [ ] POST/PUT (not sure)
  - [ ] DELETE (not sure)
  - [ ] Functions (not sure)
- [ ] Graphical tool to visualize the structure of the OData service
- [ ] OData V4 support

## Installation

Clone the project

```bash
  git clone https://github.com/kevinbalboni/openui5-odata-visualizer.git
```
Go to the project directory

```bash
  cd openui5-odata-visualizer
```

Install dependencies

```bash
  npm install
```

Start the server

```bash
  npm run start
```

## Authors

- [@kevinbalboni](https://github.com/kevinbalboni)

## 🔗 Links
[![portfolio](https://img.shields.io/badge/my_portfolio-000?style=for-the-badge&logo=ko-fi&logoColor=white)](http://k-develop.it/)
[![linkedin](https://img.shields.io/badge/linkedin-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/kevin-balboni/)
