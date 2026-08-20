# AWS EC2 & CI/CD Pipeline Interactive Guide

Welcome! This is an interactive guide and pipeline simulator built to help you understand how to build a CI/CD pipeline deploying a website to an AWS EC2 instance.

It covers both **GitHub Actions** (fully hosted, recommended) and **Jenkins** (self-hosted).

## How to Run Locally

You can open the interactive dashboard instantly:

1. **Option A (Double Click):** Double-click the [`index.html`](file:///c:/Users/preethis/Projects/AWS-TEST/index.html) file inside this project directory to open it directly in your web browser.
2. **Option B (Dev Server):** Start a lightweight web server in this directory using any of the following commands:
   
   Using Python:
   ```bash
   python -m http.server 8000
   ```
   Or using Node.js:
   ```bash
   npx -y serve .
   ```
   Then open `http://localhost:8000` (or `http://localhost:3000`) in your browser.

---

## What is Inside the Dashboard

- **Architecture flow:** Visual SVG flow demonstrating how code gets from your local environment -> GitHub -> Runner -> EC2 instance.
- **Requirement Checklist:** Keep track of AWS Accounts, EC2 setups, SSH Private Keys, and GitHub accounts needed.
- **Walkthrough Wizard:** A step-by-step assistant guiding you on launching EC2, installing Nginx, running permissions configurations, and adding keys.
- **Config Generator:** Input your server details (IP, username) and click to auto-generate the exact workflow YAML files for GitHub Actions or Jenkins pipelines.
- **Pipeline Simulator:** Click "Trigger Push & Deploy" to watch a live simulated CI/CD run checking out files, running tests, establishing SSH with EC2, copying HTML assets, and reloading Nginx.

---

## Sample Application

We have prepared a lightweight, interactive website inside the [`/web`](file:///c:/Users/preethis/Projects/AWS-TEST/web/) folder that you will deploy. You can view the files:
- [`web/index.html`](file:///c:/Users/preethis/Projects/AWS-TEST/web/index.html)
- [`web/styles.css`](file:///c:/Users/preethis/Projects/AWS-TEST/web/styles.css)
- [`web/script.js`](file:///c:/Users/preethis/Projects/AWS-TEST/web/script.js)
