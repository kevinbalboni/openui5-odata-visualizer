# OData Visualizer
<img src="https://raw.githubusercontent.com/kevinbalboni/openui5-odata-visualizer/main/webapp/img/Logo_trasparente_piccolo_new.png" width="200" heigth="200">

A simple tool to explore V2 OData services

Try <a href="https://kevinbalboni.github.io/openui5-odata-visualizer/" target="_blank">Live Demo</a>

## Roadmap

- [X] Export all tables to CSV/Excel
- [X] Export metadata to file
- [ ] check logo (sfocato)
- [ ] Credits page
- [ ] check Entity navigation cardinality (Example "* ... 0..1" ?!?!?!?!??!?!?!)
- [X] Count number of entities, functions, complex types
- [ ] Basic authentication for OData Services
- [ ] Custom header for Odata Services
- [ ] Function 
  - [ ] Bounded
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
