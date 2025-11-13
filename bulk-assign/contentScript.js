
// Utility: Get user role from the role chip
function getUserRole() {
  // Target the role chip specifically
  const roleChip = document.querySelector('.MuiChip-label');
  if (roleChip) {
    return roleChip.textContent.trim();
  }
  return '';
}

function isRoleAllowed(role) {
  return role === 'ADMIN' || role.endsWith('_SUPERVISOR');
}

function shouldEnableExtension() {
  const role = getUserRole();
  return isRoleAllowed(role);
}


const allowedPaths = [
  '/collection/list/over-due',
  '/collection/list/on-due',
  '/collection/list/before-due',
  '/draft-application/list/new',
];

function isAllowedPath() {
  return allowedPaths.some(path => window.location.pathname.endsWith(path));
}


function waitForTable() {
  return new Promise(resolve => {
    const interval = setInterval(() => {
      const table = document.querySelector('table');
      if (table) {
        clearInterval(interval);
        resolve(table);
      }
    }, 500);
  });
}


async function injectBulkAssignUI() {
  if (!isAllowedPath()) return;
  injectBulkAssignCSS();
  const table = await waitForTable();
  if (!table) return;

  
  table.style.position = 'relative';
  if (table.parentElement) table.parentElement.style.position = 'relative';
  
  const theadRow = table.querySelector('thead tr');
  if (theadRow) {
    const customerTh = Array.from(theadRow.querySelectorAll('th')).find(th => th.textContent.trim().toLowerCase().includes('customer info'));
    if (customerTh && !customerTh.querySelector('.bulk-assign-header-checkbox')) {
      const headerCb = document.createElement('input');
      headerCb.type = 'checkbox';
      headerCb.className = 'bulk-assign-header-checkbox';
      headerCb.style.marginRight = '8px';
      customerTh.insertBefore(headerCb, customerTh.firstChild);
    }
  }
  
  const rows = table.querySelectorAll('tbody tr');
  rows.forEach(row => {
    const customerTd = row.querySelector('td');
    if (customerTd && !customerTd.querySelector('.bulk-assign-checkbox')) {
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.className = 'bulk-assign-checkbox';
      cb.style.marginRight = '8px';
      customerTd.insertBefore(cb, customerTd.firstChild);
    }
  });
  
  const headerCb = table.querySelector('.bulk-assign-header-checkbox');
  if (headerCb) {
    headerCb.onclick = () => {
      rows.forEach(row => {
        const cb = row.querySelector('.bulk-assign-checkbox');
        if (cb) cb.checked = headerCb.checked;
      });
    };
  }
  if (!document.getElementById('bulk-assign-controls')) {
    const controls = document.createElement('div');
    controls.id = 'bulk-assign-controls';
    controls.innerHTML = `
      <select id="bulk-assign-agent" style="margin-right:8px;"></select>
      <button id="bulk-assign-btn">Bulk Assign</button>
    `;
    document.body.appendChild(controls);
    const assigneeTh = Array.from(table.querySelectorAll('th')).find(th => th.textContent.trim().toLowerCase().includes('assignee'));
    if (assigneeTh) {
      const rect = assigneeTh.getBoundingClientRect();
      controls.style.top = `${rect.top + window.scrollY + 8}px`;
        controls.style.left = `${rect.right + window.scrollX + 16}px`;
        controls.style.right = '';
        controls.style.transform = 'none';
      }

      // Populate agent dropdown from first row
      const agentSelect = controls.querySelector('#bulk-assign-agent');
      const firstAgentCell = table.querySelector('tbody tr td:last-child');
      if (firstAgentCell) {
        const options = firstAgentCell.querySelectorAll('option');
        options.forEach(opt => {
          const clone = opt.cloneNode(true);
          agentSelect.appendChild(clone);
        });
      }

      // Bulk assign logic
      controls.querySelector('#bulk-assign-btn').onclick = () => {
        const selectedAgent = agentSelect.value;
        rows.forEach(row => {
          const cb = row.querySelector('.bulk-assign-checkbox');
          if (cb && cb.checked) {
            // Find agent dropdown in row and set value
            const agentCell = row.querySelector('select');
            if (agentCell) {
              agentCell.value = selectedAgent;
              agentCell.dispatchEvent(new Event('change', { bubbles: true }));
            }
          }
        });
      };
    }
  if (!document.getElementById('bulk-assign-controls')) {
    const controls = document.createElement('div');
    controls.id = 'bulk-assign-controls';
    controls.innerHTML = `
      <select id="bulk-assign-agent" style="margin-right:8px;"></select>
      <button id="bulk-assign-btn">Bulk Assign</button>
    `;
    document.body.appendChild(controls);

    // Populate agent dropdown from first row
    const agentSelect = controls.querySelector('#bulk-assign-agent');
    const firstAgentCell = table.querySelector('tbody tr td:last-child');
    if (firstAgentCell) {
      const options = firstAgentCell.querySelectorAll('option');
      options.forEach(opt => {
        const clone = opt.cloneNode(true);
        agentSelect.appendChild(clone);
      });
    }
    // Bulk assign logic
    controls.querySelector('#bulk-assign-btn').onclick = () => {
      const selectedAgent = agentSelect.value;
      rows.forEach(row => {
        const cb = row.querySelector('.bulk-assign-checkbox');
        if (cb && cb.checked) {
          // Find agent dropdown in row and set value
          const agentCell = row.querySelector('select');
          if (agentCell) {
            agentCell.value = selectedAgent;
            agentCell.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }
      });
    };
  }
}

// Inject CSS for bulk assign controls
function injectBulkAssignCSS() {
  if (document.getElementById('bulk-assign-style')) return;
  const style = document.createElement('link');
  style.rel = 'stylesheet';
  style.type = 'text/css';
  style.href = chrome.runtime.getURL('contentScript.css');
  style.id = 'bulk-assign-style';
  document.head.appendChild(style);
}

// SPA navigation support: observe URL and history changes
let lastPath = window.location.pathname;
function cleanBulkAssignUI() {
  const oldControls = document.getElementById('bulk-assign-controls');
  if (oldControls) oldControls.remove();
  document.querySelectorAll('.bulk-assign-checkbox').forEach(cb => {
    const td = cb.closest('td.bulk-assign-sticky');
    if (td) td.remove();
    else cb.remove();
  });
  const th = document.querySelector('th.bulk-assign-sticky');
  if (th) th.remove();
}

function handleNavigation() {
  if (window.location.pathname !== lastPath) {
    lastPath = window.location.pathname;
    cleanBulkAssignUI();
    if (isAllowedPath()) injectBulkAssignUI();
  }
}

function observeUrlChange() {
  const observer = new MutationObserver(handleNavigation);
  observer.observe(document.body, { childList: true, subtree: true });
}

// Listen for history changes (SPA navigation)
window.addEventListener('popstate', handleNavigation);
['pushState', 'replaceState'].forEach(evt => {
  const orig = history[evt];
  history[evt] = function () {
    const ret = orig.apply(this, arguments);
    handleNavigation();
    return ret;
  };
});

// Initial injection
if (isAllowedPath() && shouldEnableExtension()) injectBulkAssignUI();
observeUrlChange();

// Inject CSS for bulk assign controls
function injectBulkAssignCSS() {
  if (document.getElementById('bulk-assign-style')) return;
  const style = document.createElement('link');
  style.rel = 'stylesheet';
  style.type = 'text/css';
  style.href = chrome.runtime.getURL('contentScript.css');
  style.id = 'bulk-assign-style';
  document.head.appendChild(style);
}


