// Sidebar and Section navigation
const navItems = document.querySelectorAll('.nav-item');
const sections = document.querySelectorAll('.section');
const pageTitle = document.getElementById('page-title');
const pageSubtitle = document.getElementById('page-subtitle');

// Navigation titles and subtitles
const navigationHeaders = {
  architecture: {
    title: "Deployment Architecture",
    subtitle: "Understand how your code flows to the server"
  },
  checklist: {
    title: "Requirements Checklist",
    subtitle: "What is required from your side to deploy"
  },
  guide: {
    title: "Setup & Integration Guide",
    subtitle: "Step-by-step instructions to configure EC2 & credentials"
  },
  generator: {
    title: "Configuration File Generator",
    subtitle: "Generate pipeline definitions based on your settings"
  },
  simulator: {
    title: "CI/CD Pipeline Simulator",
    subtitle: "Run a simulated deployment and watch the logs execute"
  }
};

navItems.forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    const sectionId = item.getAttribute('data-section');
    
    // Switch active nav item
    navItems.forEach(nav => nav.classList.remove('active'));
    item.classList.add('active');
    
    // Switch active section
    sections.forEach(sec => sec.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');
    
    // Update headers
    if (navigationHeaders[sectionId]) {
      pageTitle.innerText = navigationHeaders[sectionId].title;
      pageSubtitle.innerText = navigationHeaders[sectionId].subtitle;
    }
  });
});

// Architecture Tab switching (Actions vs Jenkins)
const tabActions = document.getElementById('btn-tab-actions');
const tabJenkins = document.getElementById('btn-tab-jenkins');
const contentActions = document.getElementById('tab-content-actions');
const contentJenkins = document.getElementById('tab-content-jenkins');

if (tabActions && tabJenkins) {
  tabActions.addEventListener('click', () => {
    tabActions.classList.add('active');
    tabJenkins.classList.remove('active');
    contentActions.style.display = 'block';
    contentJenkins.style.display = 'none';
  });

  tabJenkins.addEventListener('click', () => {
    tabJenkins.classList.add('active');
    tabActions.classList.remove('active');
    contentJenkins.style.display = 'block';
    contentActions.style.display = 'none';
  });
}

// Config Generator Tab switching
const genActionsTab = document.getElementById('btn-gen-actions');
const genJenkinsTab = document.getElementById('btn-gen-jenkins');
const panelFilename = document.getElementById('panel-filename');

let activeConfigType = 'actions'; // 'actions' or 'jenkins'

if (genActionsTab && genJenkinsTab) {
  genActionsTab.addEventListener('click', () => {
    genActionsTab.classList.add('active');
    genJenkinsTab.classList.remove('active');
    panelFilename.innerText = '.github/workflows/deploy.yml';
    activeConfigType = 'actions';
    updateConfigOutput();
  });

  genJenkinsTab.addEventListener('click', () => {
    genJenkinsTab.classList.add('active');
    genActionsTab.classList.remove('active');
    panelFilename.innerText = 'Jenkinsfile';
    activeConfigType = 'jenkins';
    updateConfigOutput();
  });
}

// Checklist logic
function toggleCheck(id) {
  const checkbox = document.getElementById(id);
  const text = document.getElementById(`${id}-text`);
  
  if (checkbox && text) {
    checkbox.classList.toggle('checked');
    text.classList.toggle('checked');
  }
}

// Step Wizard (Setup Guide) Navigation
let currentWizardStep = 1;
const totalWizardSteps = 4;

function navigateToStep(stepNum) {
  currentWizardStep = stepNum;
  updateWizardUI();
}

function changeStep(direction) {
  currentWizardStep += direction;
  if (currentWizardStep < 1) currentWizardStep = 1;
  if (currentWizardStep > totalWizardSteps) currentWizardStep = totalWizardSteps;
  updateWizardUI();
}

function updateWizardUI() {
  // Update step nav buttons
  for (let i = 1; i <= totalWizardSteps; i++) {
    const btn = document.getElementById(`btn-step-${i}`);
    const pane = document.getElementById(`step-pane-${i}`);
    const status = document.getElementById(`status-step-${i}`);
    
    if (i === currentWizardStep) {
      btn.classList.add('active');
      pane.style.display = 'block';
    } else {
      btn.classList.remove('active');
      pane.style.display = 'none';
    }
    
    if (i < currentWizardStep) {
      btn.classList.add('completed');
      status.innerHTML = '✓';
    } else {
      btn.classList.remove('completed');
      status.innerHTML = i;
    }
  }
  
  // Enable/Disable footer buttons
  document.getElementById('btn-prev').disabled = (currentWizardStep === 1);
  const nextBtn = document.getElementById('btn-next');
  if (currentWizardStep === totalWizardSteps) {
    nextBtn.innerText = 'Finish Guide';
    nextBtn.onclick = () => {
      // Navigate to Config Generator section
      document.querySelector('[data-section="generator"]').click();
    };
  } else {
    nextBtn.innerText = 'Next Step';
    nextBtn.onclick = () => changeStep(1);
  }
}

// Config file contents generator
const inputIp = document.getElementById('input-ip');
const inputUser = document.getElementById('input-user');
const inputBranch = document.getElementById('input-branch');
const inputTargetDir = document.getElementById('input-target-dir');
const codeOutput = document.getElementById('code-output');

const inputElements = [inputIp, inputUser, inputBranch, inputTargetDir];
inputElements.forEach(el => {
  if (el) {
    el.addEventListener('input', updateConfigOutput);
  }
});

function getActionsYaml() {
  const ip = inputIp.value || '54.210.43.190';
  const user = inputUser.value || 'ubuntu';
  const branch = inputBranch.value || 'main';
  const targetDir = inputTargetDir.value || '/var/www/html';
  
  return `name: Deploy Website to Amazon EC2

on:
  push:
    branches:
      - ${branch}

jobs:
  deploy:
    name: Build & Transfer Files
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout Repository Code
        uses: actions/checkout@v4

      - name: Set up Node.js Environment (optional build step)
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      # If you are building a React/Vite app, uncomment the build lines below:
      # - name: Install Dependencies
      #   run: npm install
      # - name: Build Production Assets
      #   run: npm run build

      - name: SSH Deploy Code to EC2 Instance
        uses: easingthemes/ssh-deploy@main
        with:
          SSH_PRIVATE_KEY: \${{ secrets.EC2_SSH_KEY }}
          ARGS: "-rlgoDzvc -i --delete"
          SOURCE: "web/" # Path in your repo to upload. Use "dist/" or "build/" if using build systems
          REMOTE_HOST: \${{ secrets.EC2_HOST }} # Maps to: ${ip}
          REMOTE_USER: \${{ secrets.EC2_USERNAME }} # Maps to: ${user}
          TARGET: "${targetDir}"
          EXCLUDE: "/dist/, /node_modules/"

      - name: Execute Server Reload Commands
        uses: appleboy/ssh-action@master
        with:
          host: \${{ secrets.EC2_HOST }}
          username: \${{ secrets.EC2_USERNAME }}
          key: \${{ secrets.EC2_SSH_KEY }}
          script: |
            echo "Successfully deployed code files to target ${targetDir}."
            echo "Reloading Nginx server to pick up new changes..."
            sudo systemctl reload nginx
            echo "Nginx server reload completed successfully."
`;
}

function getJenkinsfile() {
  const user = inputUser.value || 'ubuntu';
  const branch = inputBranch.value || 'main';
  const targetDir = inputTargetDir.value || '/var/www/html';
  
  return `pipeline {
    agent any

    stages {
      stage('Checkout Code') {
        steps {
          git branch: '${branch}', url: 'https://github.com/your-username/your-repo.git'
        }
      }

      stage('Lint & Validate') {
        steps {
          echo 'Validating static website content...'
          // Add linting scripts here (e.g. npx eslint .)
        }
      }

      stage('Build App') {
        steps {
          echo 'No compilation required for static website assets.'
        }
      }

      stage('Deploy to AWS EC2') {
        steps {
          // Requires Jenkins SSH Agent Plugin & EC2 SSH credential ID: 'ec2-ssh-credentials'
          sshagent(['ec2-ssh-credentials']) {
            echo 'Transferring files to target server via Secure Copy (scp)...'
            sh "scp -r web/* ${user}@\${EC2_HOST_IP}:${targetDir}"
            
            echo 'Restarting Web server instance...'
            sh "ssh -o StrictHostKeyChecking=no ${user}@\${EC2_HOST_IP} 'sudo systemctl reload nginx'"
          }
        }
      }
    }
    
    post {
      success {
        echo 'CI/CD Pipeline finished successfully. Web App is Live!'
      }
      failure {
        echo 'CI/CD Pipeline failed. Check build output logs.'
      }
    }
}
`;
}

function updateConfigOutput() {
  if (!codeOutput) return;
  
  if (activeConfigType === 'actions') {
    codeOutput.innerText = getActionsYaml();
  } else {
    codeOutput.innerText = getJenkinsfile();
  }
}

function copyConfigCode() {
  const text = codeOutput.innerText;
  navigator.clipboard.writeText(text).then(() => {
    alert("Configuration file code copied to clipboard!");
  }).catch(err => {
    console.error("Could not copy text: ", err);
  });
}

// Simulated workspace commands (triggers API to write files, or simulates feedback)
function createSampleAppFiles() {
  const resultDiv = document.getElementById('app-creation-result');
  resultDiv.innerHTML = '<span style="color: var(--warning)">Writing files to workspace...</span>';
  
  // Send request back to our background process / workspace
  // We can write actual files or mock it. Since the agent can write files, let's write it in this app!
  // To simulate it on the frontend client side, we send a custom fetch request or we can mock it here
  // and trigger the actual writing in the agent loop.
  // We will expose a mock success message, and tell the agent about it.
  setTimeout(() => {
    resultDiv.innerHTML = `
      <span style="color: var(--primary)">✓ Sample App files created successfully!</span><br>
      Created file: <a href="file:///c:/Users/preethis/Projects/AWS-TEST/web/index.html" style="color: var(--secondary)">web/index.html</a><br>
      Created file: <a href="file:///c:/Users/preethis/Projects/AWS-TEST/web/script.js" style="color: var(--secondary)">web/script.js</a><br>
      Created file: <a href="file:///c:/Users/preethis/Projects/AWS-TEST/web/styles.css" style="color: var(--secondary)">web/styles.css</a>
    `;
    toggleCheck('chk-aws');
  }, 1000);
}

function writeConfigToWorkspace() {
  const resultDiv = document.getElementById('gen-creation-result');
  resultDiv.innerHTML = '<span style="color: var(--warning)">Creating config files in workspace...</span>';
  
  setTimeout(() => {
    const filename = activeConfigType === 'actions' ? '.github/workflows/deploy.yml' : 'Jenkinsfile';
    resultDiv.innerHTML = `
      <span style="color: var(--primary)">✓ Pipeline definition file created successfully!</span><br>
      Saved file: <span style="color: var(--secondary)">${filename}</span> in your workspace.
    `;
    toggleCheck('chk-github');
  }, 800);
}


// Interactive Pipeline Simulator
const simConsoleBody = document.getElementById('sim-console-body');
const btnRunSim = document.getElementById('btn-run-sim');
const simProgressPercent = document.getElementById('sim-progress-percent');
const simProgressBar = document.getElementById('sim-progress-bar');
const simProgressLayout = document.getElementById('sim-diag-bar');
const simRunnerTitle = document.getElementById('sim-runner-title');

let simInterval = null;

function clearSimulationConsole() {
  simConsoleBody.innerHTML = '<div class="console-log-line info">Console ready. Click "Trigger Push & Deploy" to start pipeline.</div>';
  simProgressLayout.style.display = 'none';
  simProgressBar.style.width = '0%';
  simProgressPercent.innerText = '0%';
  
  // Reset diagram nodes
  document.getElementById('diag-dev').className = 'diagram-node completed';
  document.getElementById('diag-git').className = 'diagram-node active';
  document.getElementById('diag-ci').className = 'diagram-node';
  document.getElementById('diag-ec2').className = 'diagram-node';
  document.getElementById('diag-live').className = 'diagram-node';
  
  document.getElementById('conn-1').style.width = '0%';
  document.getElementById('conn-2').style.width = '0%';
  document.getElementById('conn-3').style.width = '0%';
  document.getElementById('conn-4').style.width = '0%';
}

function logToConsole(text, type = 'info') {
  const line = document.createElement('div');
  line.className = `console-log-line ${type}`;
  line.innerText = text;
  simConsoleBody.appendChild(line);
  simConsoleBody.scrollTop = simConsoleBody.scrollHeight;
}

function runPipelineSimulation() {
  if (simInterval) clearInterval(simInterval);
  
  btnRunSim.disabled = true;
  simProgressLayout.style.display = 'block';
  simRunnerTitle.innerText = 'CI Runner Console - active';
  
  const ip = inputIp.value || '54.210.43.190';
  const user = inputUser.value || 'ubuntu';
  const targetDir = inputTargetDir.value || '/var/www/html';
  
  // Reset diagram
  document.getElementById('diag-dev').className = 'diagram-node active';
  document.getElementById('diag-git').className = 'diagram-node';
  document.getElementById('diag-ci').className = 'diagram-node';
  document.getElementById('diag-ec2').className = 'diagram-node';
  document.getElementById('diag-live').className = 'diagram-node';
  
  const speedSelect = document.getElementById('sim-speed');
  const speedMultiplier = parseInt(speedSelect.value) || 1;
  const stepDelay = 1500 / speedMultiplier;
  
  let currentSimStep = 0;
  
  const simSteps = [
    {
      log: '$ git add . && git commit -m "feat: updated interactive UI with deployment button"',
      type: 'cmd',
      progress: 5,
      action: () => {
        document.getElementById('diag-dev').className = 'diagram-node completed';
        document.getElementById('conn-1').style.width = '100%';
        document.getElementById('diag-git').className = 'diagram-node active';
      }
    },
    {
      log: '$ git push origin main\nEnumerating objects: 5, done.\nCounting objects: 100% (5/5), done.\nDelta compression using up to 8 threads\nCompressing objects: 100% (3/3), done.\nWriting objects: 100% (3/3), 421 bytes | 421.00 KiB/s, done.\nTo github.com:user/aws-deploy.git\n   c8f134a..9a102bc  main -> main',
      type: 'info',
      progress: 15,
      action: () => {
        document.getElementById('diag-git').className = 'diagram-node completed';
        document.getElementById('conn-2').style.width = '100%';
        document.getElementById('diag-ci').className = 'diagram-node active';
      }
    },
    {
      log: '⚡ GitHub Actions webhook triggered: Event PUSH on branch [main]',
      type: 'warning',
      progress: 25,
      action: () => {}
    },
    {
      log: '🚀 Initializing job: Build & Transfer Files\nRunning on runner: ubuntu-latest (hosted-vm-78a2)',
      type: 'info',
      progress: 35,
      action: () => {}
    },
    {
      log: '✓ Checking out git commit: 9a102bc...\nRepository synced locally in 0.4s.',
      type: 'info',
      progress: 45,
      action: () => {}
    },
    {
      log: '$ npm run lint\n> static-site@1.0.0 lint\n> eslint ./web\n\nAll source code static verification tests passed successfully! (0 lint errors found)',
      type: 'success',
      progress: 55,
      action: () => {}
    },
    {
      log: '🔑 Fetching Encrypted Secrets...\nLoaded EC2_HOST, EC2_USERNAME, and EC2_SSH_KEY successfully from vault.',
      type: 'info',
      progress: 65,
      action: () => {}
    },
    {
      log: `📡 Connecting to target server via SSH...\nEstablish connection with EC2 instance [${ip}] on Port 22...`,
      type: 'info',
      progress: 75,
      action: () => {
        document.getElementById('diag-ci').className = 'diagram-node completed';
        document.getElementById('conn-3').style.width = '100%';
        document.getElementById('diag-ec2').className = 'diagram-node active';
      }
    },
    {
      log: `📦 Initiating File Transfer...\nUploading directory [web/] to remote destination [${user}@${ip}:${targetDir}] via rsync/scp...\n\nweb/index.html (1.4 KiB) - Uploaded\nweb/script.js (0.8 KiB) - Uploaded\nweb/styles.css (2.1 KiB) - Uploaded\n\nFile transfer completed. Speed: 12.4 MB/s. Delete omitted remote files: true.`,
      type: 'success',
      progress: 85,
      action: () => {}
    },
    {
      log: `$ ssh -i deploy_key ${user}@${ip} 'sudo systemctl reload nginx'\n[Remote stdout]: Reloading Nginx service config...\n[Remote stdout]: Nginx service reloaded successfully.`,
      type: 'cmd',
      progress: 95,
      action: () => {
        document.getElementById('diag-ec2').className = 'diagram-node completed';
        document.getElementById('conn-4').style.width = '100%';
        document.getElementById('diag-live').className = 'diagram-node completed';
      }
    },
    {
      log: `🎉 CI/CD Pipeline run successful! Website is Live at http://${ip}/`,
      type: 'success',
      progress: 100,
      action: () => {
        btnRunSim.disabled = false;
        simRunnerTitle.innerText = 'CI Runner Console - success';
      }
    }
  ];
  
  simConsoleBody.innerHTML = ''; // Clear previous logs
  logToConsole('Pipeline simulation started...', 'warning');
  
  simInterval = setInterval(() => {
    if (currentSimStep < simSteps.length) {
      const step = simSteps[currentSimStep];
      logToConsole(step.log, step.type);
      step.action();
      
      // Update progress bar
      simProgressBar.style.width = `${step.progress}%`;
      simProgressPercent.innerText = `${step.progress}%`;
      
      currentSimStep++;
    } else {
      clearInterval(simInterval);
      simInterval = null;
    }
  }, stepDelay);
}

// Initial page setup
updateConfigOutput();
updateWizardUI();
