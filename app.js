// ========== STATE MANAGEMENT ==========
const state = {
  currentUser: null,
  users: [],
  tickets: [],
  orders: [],
  currentPage: "home",
  uploadedTicketFile: null,
}

// ========== INITIALIZATION ==========
document.addEventListener("DOMContentLoaded", () => {
  loadDataFromStorage()
  setupEventListeners()
  render()
})

// ========== DATA PERSISTENCE ==========
function saveDataToStorage() {
  localStorage.setItem("tickethub_users", JSON.stringify(state.users))
  localStorage.setItem("tickethub_tickets", JSON.stringify(state.tickets))
  localStorage.setItem("tickethub_orders", JSON.stringify(state.orders))
  if (state.currentUser) {
    localStorage.setItem("tickethub_current_user", JSON.stringify(state.currentUser))
  }
}

function loadDataFromStorage() {
  const savedUsers = localStorage.getItem("tickethub_users")
  const savedTickets = localStorage.getItem("tickethub_tickets")
  const savedOrders = localStorage.getItem("tickethub_orders")
  const savedUser = localStorage.getItem("tickethub_current_user")

  if (savedUsers) state.users = JSON.parse(savedUsers)
  if (savedTickets) state.tickets = JSON.parse(savedTickets)
  if (savedOrders) state.orders = JSON.parse(savedOrders)
  if (savedUser) state.currentUser = JSON.parse(savedUser)

  // Initialize with demo data if empty
  if (state.users.length === 0) {
    initializeDemoData()
  }
}

function initializeDemoData() {
  // Demo admin user
  state.users = [
    {
      id: "admin-001",
      email: "admin@tickethub.com",
      password: "admin123",
      name: "Admin User",
      role: "admin",
      createdAt: new Date().toISOString(),
    },
    {
      id: "user-001",
      email: "john@example.com",
      password: "john123",
      name: "John Doe",
      role: "user",
      createdAt: new Date().toISOString(),
    },
    {
      id: "user-002",
      email: "jane@example.com",
      password: "jane123",
      name: "Jane Smith",
      role: "user",
      createdAt: new Date().toISOString(),
    },
  ]

  // Demo tickets
  state.tickets = [
    {
      id: "ticket-001",
      type: "railway",
      from: "New York",
      to: "Boston",
      date: "2024-01-15",
      time: "10:00",
      price: 45,
      quantity: 2,
      sellerId: "user-001",
      sellerName: "John Doe",
      status: "active",
      description: "Return tickets for Northeast Regional",
      createdAt: new Date().toISOString(),
    },
    {
      id: "ticket-002",
      type: "bus",
      from: "Los Angeles",
      to: "San Francisco",
      date: "2024-01-20",
      time: "14:30",
      price: 35,
      quantity: 1,
      sellerId: "user-002",
      sellerName: "Jane Smith",
      status: "active",
      description: "Greyhound Bus ticket",
      createdAt: new Date().toISOString(),
    },
    {
      id: "ticket-003",
      type: "flight",
      from: "Miami",
      to: "New York",
      date: "2024-01-18",
      time: "08:00",
      price: 120,
      quantity: 3,
      sellerId: "user-001",
      sellerName: "John Doe",
      status: "active",
      description: "Return flight tickets",
      createdAt: new Date().toISOString(),
    },
  ]

  state.orders = [
    {
      id: "order-001",
      ticketId: "ticket-001",
      buyerId: "user-002",
      buyerName: "Jane Smith",
      quantity: 1,
      total: 45,
      status: "completed",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ]

  saveDataToStorage()
}

// ========== EVENT LISTENERS ==========
function setupEventListeners() {
  // Navigation
  document.querySelectorAll("[data-page]").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault()
      const page = e.currentTarget.dataset.page
      navigateTo(page)
    })
  })

  // Auth Modal
  document.getElementById("closeAuthModal").addEventListener("click", () => {
    closeAuthModal()
  })

  document.getElementById("authToggleBtn").addEventListener("click", (e) => {
    e.preventDefault()
    toggleAuthMode()
  })

  document.getElementById("authForm").addEventListener("submit", (e) => {
    e.preventDefault()
    handleAuth()
  })

  // Ticket Modal
  document.getElementById("closeTicketModal").addEventListener("click", () => {
    closeTicketModal()
  })

  // Click outside modal to close
  document.getElementById("authModal").addEventListener("click", (e) => {
    if (e.target.id === "authModal") closeAuthModal()
  })

  document.getElementById("ticketModal").addEventListener("click", (e) => {
    if (e.target.id === "ticketModal") closeTicketModal()
  })
}

// ========== FILE UPLOAD HANDLER ==========
function handleFileUpload(event) {
  const file = event.target.files[0]
  if (!file) {
    state.uploadedTicketFile = null
    return
  }

  // Validate file size (5MB max)
  const maxSize = 5 * 1024 * 1024 // 5MB in bytes
  if (file.size > maxSize) {
    showAlert("File size must be less than 5MB", "error")
    event.target.value = ""
    state.uploadedTicketFile = null
    return
  }

  // Validate file type
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  if (!allowedTypes.includes(file.type)) {
    showAlert("Invalid file type. Please upload PDF, JPG, PNG, or DOC files.", "error")
    event.target.value = ""
    state.uploadedTicketFile = null
    return
  }

  // Create blob URL for file display/download
  const blobUrl = URL.createObjectURL(file)

  state.uploadedTicketFile = {
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: file.lastModified,
    blobUrl: blobUrl
  }

  showAlert("File uploaded successfully!", "success")
}

// ========== NAVIGATION ==========
function navigateTo(page) {
  state.currentPage = page
  render()
}

function openAuthModal(mode = "login") {
  document.getElementById("authMode").value = mode
  document.getElementById("authForm").reset()
  document.getElementById("authEmail").focus()

  const isSignup = mode === "signup"
  document.getElementById("authTitle").textContent = isSignup ? "Create Account" : "Login"
  document.getElementById("authButtonText").textContent = isSignup ? "Sign Up" : "Login"
  document.getElementById("nameGroup").style.display = isSignup ? "block" : "none"
  document.getElementById("authToggleText").textContent = isSignup
    ? "Already have an account? "
    : "Don't have an account? "
  document.getElementById("authToggleBtn").textContent = isSignup ? "Login" : "Sign up"

  document.getElementById("authModal").classList.remove("hidden")
}

function closeAuthModal() {
  document.getElementById("authModal").classList.add("hidden")
}

function openTicketModal(ticketId) {
  const ticket = state.tickets.find((t) => t.id === ticketId)
  if (!ticket) return

  const seller = state.users.find(u => u.id === ticket.sellerId)
  const modalBody = document.getElementById("ticketModalBody")
  const buyer = state.currentUser && state.currentUser.id !== ticket.sellerId

  modalBody.innerHTML = `
        <div style="margin-bottom: 2rem;">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                <div>
                    <span class="ticket-type">${ticket.type.toUpperCase()}</span>
                    <h3 style="margin-top: 1rem; font-size: 1.5rem;">${ticket.from} → ${ticket.to}</h3>
                </div>
                <div style="text-align: right;">
                    <div class="price">$${ticket.price}</div>
                    <div style="color: var(--text-secondary); font-size: 0.875rem;">per ticket</div>
                </div>
            </div>

            <div class="card-meta">
                <div>📅 ${new Date(ticket.date).toLocaleDateString()}</div>
                <div>🕐 ${ticket.time}</div>
                <div>📦 ${ticket.quantity} available</div>
            </div>

            <div style="margin: 2rem 0; padding: 1.5rem; background-color: var(--bg-tertiary); border-radius: var(--radius);">
                <p>${ticket.description}</p>
                ${ticket.file ? `
                    <div style="margin-top: 1rem; padding: 1rem; background-color: var(--bg-secondary); border-radius: var(--radius);">
                        <h5 style="margin-bottom: 0.5rem;">📎 Attached File</h5>
                        <p style="margin: 0 0 0.5rem 0; color: var(--text-secondary); font-size: 0.875rem;">
                            ${ticket.file.name} (${(ticket.file.size / 1024 / 1024).toFixed(2)} MB)
                        </p>
                        ${ticket.file.type.startsWith('image/') ? `
                            <img src="${ticket.file.blobUrl}" alt="Ticket file" style="max-width: 100%; max-height: 300px; border-radius: var(--radius); margin-top: 0.5rem;">
                        ` : `
                            <a href="${ticket.file.blobUrl}" download="${ticket.file.name}" class="btn btn-secondary btn-sm" style="margin-top: 0.5rem;">
                                📥 Download File
                            </a>
                        `}
                    </div>
                ` : ''}
            </div>

            <div style="padding: 1.5rem; background-color: var(--bg-tertiary); border-radius: var(--radius); margin-bottom: 2rem;">
                <h4 style="margin-bottom: 0.5rem;">Seller Information</h4>
                <p style="color: var(--text-secondary);">${ticket.sellerName}</p>
                ${buyer ? `<p style="color: var(--text-secondary); font-size: 0.875rem;">Contact: ${seller.email}</p>` : ''}
                <p style="color: var(--text-secondary); font-size: 0.875rem;">Rating: ⭐ 4.8 (24 reviews)</p>
            </div>

            ${
              buyer
                ? `
                <div style="display: flex; gap: 1rem;">
                    <input type="number" id="buyQuantity" min="1" max="${ticket.quantity}" value="1" 
                           style="width: 100px; padding: 0.75rem; background-color: var(--bg-secondary); 
                                   border: 1px solid var(--border); border-radius: var(--radius); 
                                   color: var(--text-primary);">
                    <button class="btn btn-primary" onclick="handleBuyTicket('${ticket.id}')">
                        Buy Now
                    </button>
                </div>
            `
                : `
                <div class="alert alert-info">
                    You are the seller of this ticket
                </div>
            `
            }
        </div>
    `

  document.getElementById("ticketModal").classList.remove("hidden")
}

function closeTicketModal() {
  document.getElementById("ticketModal").classList.add("hidden")
}

// ========== AUTHENTICATION ==========
function handleAuth() {
  const mode = document.getElementById("authMode").value
  const email = document.getElementById("authEmail").value.trim()
  const password = document.getElementById("authPassword").value
  const name = document.getElementById("authName").value.trim()

  if (!email || !password) {
    showAlert("Please fill in all fields", "error")
    return
  }

  if (mode === "signup") {
    if (!name) {
      showAlert("Please enter your name", "error")
      return
    }
    handleSignup(email, password, name)
  } else {
    handleLogin(email, password)
  }
}

function handleLogin(email, password) {
  const user = state.users.find((u) => u.email === email && u.password === password)

  if (!user) {
    showAlert("Invalid email or password", "error")
    return
  }

  state.currentUser = user
  saveDataToStorage()
  closeAuthModal()
  showAlert(`Welcome back, ${user.name}!`, "success")
  render()
}

function handleSignup(email, password, name) {
  if (state.users.find((u) => u.email === email)) {
    showAlert("Email already registered", "error")
    return
  }

  const newUser = {
    id: "user-" + Date.now(),
    email,
    password,
    name,
    role: "user",
    createdAt: new Date().toISOString(),
  }

  state.users.push(newUser)
  state.currentUser = newUser
  saveDataToStorage()
  closeAuthModal()
  showAlert(`Welcome, ${name}!`, "success")
  render()
}

function handleLogout() {
  state.currentUser = null
  localStorage.removeItem("tickethub_current_user")
  showAlert("Logged out successfully", "success")
  navigateTo("home")
}

function toggleAuthMode() {
  const currentMode = document.getElementById("authMode").value
  const newMode = currentMode === "login" ? "signup" : "login"
  openAuthModal(newMode)
}

// ========== TICKET OPERATIONS ==========
function handleBuyTicket(ticketId) {
  if (!state.currentUser) {
    showAlert("Please login to buy tickets", "error")
    openAuthModal("login")
    return
  }

  const ticket = state.tickets.find((t) => t.id === ticketId)
  if (!ticket) return

  const quantity = Number.parseInt(document.getElementById("buyQuantity").value)

  if (quantity > ticket.quantity) {
    showAlert("Not enough tickets available", "error")
    return
  }

  const order = {
    id: "order-" + Date.now(),
    ticketId: ticket.id,
    buyerId: state.currentUser.id,
    buyerName: state.currentUser.name,
    quantity,
    total: ticket.price * quantity,
    status: "completed",
    createdAt: new Date().toISOString(),
  }

  state.orders.push(order)
  ticket.quantity -= quantity

  if (ticket.quantity === 0) {
    ticket.status = "sold"
  }

  saveDataToStorage()
  closeTicketModal()
  showAlert("Ticket purchased successfully!", "success")
  render()
}

// ========== PAGE RENDERING ==========
function render() {
  updateNavigation()
  const mainContent = document.getElementById("mainContent")

  switch (state.currentPage) {
    case "home":
      mainContent.innerHTML = renderHome()
      break
    case "browse":
      mainContent.innerHTML = renderBrowse()
      break
    case "sell":
      mainContent.innerHTML = state.currentUser ? renderSell() : renderNotLoggedIn()
      break
    case "my-tickets":
      mainContent.innerHTML = state.currentUser ? renderMyTickets() : renderNotLoggedIn()
      break
    case "admin":
      mainContent.innerHTML =
        state.currentUser && state.currentUser.role === "admin" ? renderAdmin() : renderUnauthorized()
      break
    default:
      mainContent.innerHTML = renderHome()
  }
}

function updateNavigation() {
  const navAuthSection = document.getElementById("navAuthSection")

  if (state.currentUser) {
    navAuthSection.innerHTML = `
            <span style="color: var(--text-secondary);">Hello, ${state.currentUser.name}</span>
            <a href="#" class="nav-link" data-page="my-tickets">My Tickets</a>
            <a href="#" class="nav-link" data-page="sell">Sell Ticket</a>
            ${state.currentUser.role === "admin" ? `<a href="#" class="nav-link" data-page="admin">Admin</a>` : ""}
            <button class="btn btn-secondary btn-sm" onclick="handleLogout()">Logout</button>
        `
    document.querySelectorAll("[data-page]").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault()
        const page = e.currentTarget.dataset.page
        navigateTo(page)
      })
    })
  } else {
    navAuthSection.innerHTML = `
            <button class="btn btn-primary btn-sm" onclick="openAuthModal('login')">Login</button>
            <button class="btn btn-secondary btn-sm" onclick="openAuthModal('signup')">Sign Up</button>
        `
  }
}

// ========== HOME PAGE ==========
function renderHome() {
  const activeTickets = state.tickets.filter((t) => t.status === "active").length

  return `
        <div class="page">
            <div class="hero">
                <h1>Welcome to TicketHub</h1>
                <p>Your trusted marketplace for railway, bus, and flight tickets</p>
                <div class="hero-buttons">
                    <button class="btn btn-primary" onclick="navigateTo('browse')">Browse Tickets</button>
                    ${state.currentUser ? `<button class="btn btn-secondary" onclick="navigateTo('sell')">Sell Tickets</button>` : `<button class="btn btn-secondary" onclick="openAuthModal('signup')">Start Selling</button>`}
                </div>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 2rem; margin-bottom: 3rem;">
                <div class="stat-card">
                    <div class="stat-value">${state.tickets.length}</div>
                    <div class="stat-label">Total Listings</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${activeTickets}</div>
                    <div class="stat-label">Active Tickets</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${state.orders.length}</div>
                    <div class="stat-label">Completed Sales</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${state.users.length - 1}</div>
                    <div class="stat-label">Active Users</div>
                </div>
            </div>

            <h2 style="margin-bottom: 2rem;">Featured Listings</h2>
            <div class="grid">
                ${state.tickets
                  .slice(0, 6)
                  .map((ticket) => renderTicketCard(ticket))
                  .join("")}
            </div>
        </div>
    `
}

// ========== BROWSE PAGE ==========
function renderBrowse() {
  const filteredTickets = state.tickets.filter((t) => t.status === "active")

  return `
        <div class="page">
            <div class="browse-header">
                <h1>Browse Tickets</h1>
                <span>${filteredTickets.length} results</span>
            </div>

            <div class="search-filter">
                <input type="text" id="searchInput" placeholder="Search by route..." 
                       style="flex: 1; min-width: 200px;">
                <select id="typeFilter">
                    <option value="">All Types</option>
                    <option value="railway">Railway</option>
                    <option value="bus">Bus</option>
                    <option value="flight">Flight</option>
                </select>
                <select id="sortFilter">
                    <option value="newest">Newest First</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                </select>
            </div>

            <div class="grid" id="ticketsGrid">
                ${
                  filteredTickets.length > 0
                    ? filteredTickets.map((ticket) => renderTicketCard(ticket)).join("")
                    : '<div class="empty-state"><div class="empty-state-icon">📭</div><h3>No tickets found</h3><p>Try adjusting your search filters</p></div>'
                }
            </div>
        </div>
    `
}

// ========== SELL PAGE ==========
function renderSell() {
  return `
        <div class="page">
            <h1>Sell Your Tickets</h1>
            <form id="sellForm" class="card" style="max-width: 600px; margin: 2rem auto;">
                <h2 style="margin-bottom: 2rem;">List New Tickets</h2>

                <div class="form-group">
                    <label for="ticketType">Ticket Type</label>
                    <select id="ticketType" required>
                        <option value="">Select type</option>
                        <option value="railway">Railway</option>
                        <option value="bus">Bus</option>
                        <option value="flight">Flight</option>
                    </select>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <div class="form-group">
                        <label for="ticketFrom">From</label>
                        <input type="text" id="ticketFrom" placeholder="Departure city" required>
                    </div>
                    <div class="form-group">
                        <label for="ticketTo">To</label>
                        <input type="text" id="ticketTo" placeholder="Arrival city" required>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <div class="form-group">
                        <label for="ticketDate">Date</label>
                        <input type="date" id="ticketDate" required>
                    </div>
                    <div class="form-group">
                        <label for="ticketTime">Time</label>
                        <input type="time" id="ticketTime" required>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <div class="form-group">
                        <label for="ticketPrice">Price per Ticket ($)</label>
                        <input type="number" id="ticketPrice" min="1" step="0.01" required>
                    </div>
                    <div class="form-group">
                        <label for="ticketQuantity">Quantity</label>
                        <input type="number" id="ticketQuantity" min="1" value="1" required>
                    </div>
                </div>

                <div class="form-group">
                    <label for="ticketDescription">Description</label>
                    <textarea id="ticketDescription" placeholder="Additional details about your tickets..." rows="4"></textarea>
                </div>

                <div class="form-group">
                    <label for="ticketFile">Upload Ticket File (Optional)</label>
                    <input type="file" id="ticketFile" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" 
                           onchange="handleFileUpload(event)">
                    <small style="color: var(--text-secondary); font-size: 0.875rem;">
                        Supported formats: PDF, JPG, PNG, DOC, DOCX (Max 5MB)
                    </small>
                </div>

                <button type="submit" class="btn btn-primary btn-full">List Tickets</button>
            </form>
        </div>
    `
}

// Handle sell form submission
document.addEventListener("submit", (e) => {
  if (e.target.id === "sellForm") {
    e.preventDefault()

    const type = document.getElementById("ticketType").value
    const from = document.getElementById("ticketFrom").value.trim()
    const to = document.getElementById("ticketTo").value.trim()
    const date = document.getElementById("ticketDate").value
    const time = document.getElementById("ticketTime").value
    const price = Number.parseFloat(document.getElementById("ticketPrice").value)
    const quantity = Number.parseInt(document.getElementById("ticketQuantity").value)
    const description = document.getElementById("ticketDescription").value.trim()

    if (!type || !from || !to || !date || !time || !price || !quantity) {
      showAlert("Please fill in all required fields", "error")
      return
    }

    const newTicket = {
      id: "ticket-" + Date.now(),
      type,
      from,
      to,
      date,
      time,
      price,
      quantity,
      description,
      sellerId: state.currentUser.id,
      sellerName: state.currentUser.name,
      status: "active",
      createdAt: new Date().toISOString(),
      file: state.uploadedTicketFile || null,
    }

    state.tickets.push(newTicket)
    saveDataToStorage()

    // Reset form and uploaded file state
    document.getElementById("sellForm").reset()
    state.uploadedTicketFile = null

    showAlert("Ticket listed successfully!", "success")
    navigateTo("my-tickets")
  }
})

// ========== MY TICKETS PAGE ==========
function renderMyTickets() {
  const myTickets = state.tickets.filter((t) => t.sellerId === state.currentUser.id)
  const myOrders = state.orders.filter((o) => o.buyerId === state.currentUser.id)

  return `
        <div class="page">
            <h1>My Account</h1>

            <div class="tabs" id="accountTabs">
                <button class="tab active" data-tab="listings">My Listings</button>
                <button class="tab" data-tab="purchases">My Purchases</button>
            </div>

            <div id="listings" class="tab-content">
                ${
                  myTickets.length > 0
                    ? `
                    <div class="grid">
                        ${myTickets
                          .map(
                            (ticket) => `
                            <div class="card">
                                <div class="card-header">
                                    <div>
                                        <span class="ticket-type">${ticket.type.toUpperCase()}</span>
                                        <h3 class="card-title">${ticket.from} → ${ticket.to}</h3>
                                    </div>
                                    <span class="status ${ticket.quantity > 0 ? "status-active" : "status-sold"}">
                                        ${ticket.quantity > 0 ? "Active" : "Sold Out"}
                                    </span>
                                </div>
                                <div class="card-meta">
                                    <span>📅 ${new Date(ticket.date).toLocaleDateString()}</span>
                                    <span>🕐 ${ticket.time}</span>
                                    <span>📦 ${ticket.quantity} left</span>
                                </div>
                                <div class="card-footer">
                                    <div class="price">$${ticket.price}</div>
                                    <button class="btn btn-danger btn-sm" onclick="deleteTicket('${ticket.id}')">Delete</button>
                                </div>
                            </div>
                        `,
                          )
                          .join("")}
                    </div>
                `
                    : `
                    <div class="empty-state">
                        <div class="empty-state-icon">📋</div>
                        <h3>No listings yet</h3>
                        <p>Start selling your tickets to see them here</p>
                        <button class="btn btn-primary" onclick="navigateTo('sell')">List Tickets</button>
                    </div>
                `
                }
            </div>

            <div id="purchases" class="tab-content" style="display:none;">
                ${
                  myOrders.length > 0
                    ? `
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Ticket</th>
                                <th>Quantity</th>
                                <th>Total</th>
                                <th>Date</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${myOrders
                              .map((order) => {
                                const ticket = state.tickets.find((t) => t.id === order.ticketId)
                                return `
                                    <tr>
                                        <td>${ticket ? ticket.from + " → " + ticket.to : "Unknown"}</td>
                                        <td>${order.quantity}</td>
                                        <td>$${order.total}</td>
                                        <td>${new Date(order.createdAt).toLocaleDateString()}</td>
                                        <td><span class="status status-active">✓ ${order.status}</span></td>
                                    </tr>
                                `
                              })
                              .join("")}
                        </tbody>
                    </table>
                `
                    : `
                    <div class="empty-state">
                        <div class="empty-state-icon">🎫</div>
                        <h3>No purchases yet</h3>
                        <p>Browse and buy tickets to see your purchases here</p>
                        <button class="btn btn-primary" onclick="navigateTo('browse')">Browse Tickets</button>
                    </div>
                `
                }
            </div>
        </div>
    `
}

function deleteTicket(ticketId) {
  if (confirm("Are you sure you want to delete this ticket?")) {
    state.tickets = state.tickets.filter((t) => t.id !== ticketId)
    saveDataToStorage()
    showAlert("Ticket deleted successfully", "success")
    render()
  }
}

// Tab switching
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("tab")) {
    const tabs = e.target.parentElement.querySelectorAll(".tab")
    tabs.forEach((t) => t.classList.remove("active"))
    e.target.classList.add("active")

    const contents = e.target.parentElement.parentElement.querySelectorAll(".tab-content")
    contents.forEach((c) => (c.style.display = "none"))
    document.getElementById(e.target.dataset.tab).style.display = "block"
  }
})

// ========== ADMIN PAGE ==========
function renderAdmin() {
  const totalRevenue = state.orders.reduce((sum, o) => sum + o.total, 0)
  const recentOrders = state.orders.slice(-5).reverse()

  return `
        <div class="page">
            <h1>Admin Dashboard</h1>

            <div class="dashboard-grid">
                <div class="stat-card">
                    <div class="stat-value">${state.users.length - 1}</div>
                    <div class="stat-label">Total Users</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${state.tickets.length}</div>
                    <div class="stat-label">Total Listings</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${state.orders.length}</div>
                    <div class="stat-label">Total Orders</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">$${totalRevenue.toFixed(2)}</div>
                    <div class="stat-label">Platform Revenue</div>
                </div>
            </div>

            <div class="tabs" id="adminTabs">
                <button class="tab active" data-tab="users">Manage Users</button>
                <button class="tab" data-tab="tickets">Manage Tickets</button>
                <button class="tab" data-tab="orders">Recent Orders</button>
            </div>

            <div id="users" class="tab-content">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Joined</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${state.users
                          .filter((u) => u.role !== "admin")
                          .map(
                            (user) => `
                            <tr>
                                <td>${user.name}</td>
                                <td>${user.email}</td>
                                <td><span class="badge">${user.role}</span></td>
                                <td>${new Date(user.createdAt).toLocaleDateString()}</td>
                                <td>
                                    <div class="table-actions">
                                        <button class="btn btn-sm btn-danger" onclick="deleteUser('${user.id}')">Delete</button>
                                    </div>
                                </td>
                            </tr>
                        `,
                          )
                          .join("")}
                    </tbody>
                </table>
            </div>

            <div id="tickets" class="tab-content" style="display:none;">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Route</th>
                            <th>Type</th>
                            <th>Price</th>
                            <th>Quantity</th>
                            <th>Status</th>
                            <th>Seller</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${state.tickets
                          .map(
                            (ticket) => `
                            <tr>
                                <td>${ticket.from} → ${ticket.to}</td>
                                <td>${ticket.type}</td>
                                <td>$${ticket.price}</td>
                                <td>${ticket.quantity}</td>
                                <td><span class="status ${ticket.status === "active" ? "status-active" : "status-sold"}">${ticket.status}</span></td>
                                <td>${ticket.sellerName}</td>
                                <td>
                                    <div class="table-actions">
                                        <button class="btn btn-sm btn-danger" onclick="deleteAdminTicket('${ticket.id}')">Remove</button>
                                    </div>
                                </td>
                            </tr>
                        `,
                          )
                          .join("")}
                    </tbody>
                </table>
            </div>

            <div id="orders" class="tab-content" style="display:none;">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Buyer</th>
                            <th>Quantity</th>
                            <th>Total</th>
                            <th>Date</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${recentOrders
                          .map(
                            (order) => `
                            <tr>
                                <td>${order.id}</td>
                                <td>${order.buyerName}</td>
                                <td>${order.quantity}</td>
                                <td>$${order.total}</td>
                                <td>${new Date(order.createdAt).toLocaleDateString()}</td>
                                <td><span class="status status-active">✓ ${order.status}</span></td>
                            </tr>
                        `,
                          )
                          .join("")}
                    </tbody>
                </table>
            </div>
        </div>
    `
}

function deleteUser(userId) {
  if (confirm("Are you sure you want to delete this user?")) {
    state.users = state.users.filter((u) => u.id !== userId)
    state.tickets = state.tickets.filter((t) => t.sellerId !== userId)
    saveDataToStorage()
    showAlert("User deleted successfully", "success")
    render()
  }
}

function deleteAdminTicket(ticketId) {
  if (confirm("Are you sure you want to remove this ticket?")) {
    state.tickets = state.tickets.filter((t) => t.id !== ticketId)
    saveDataToStorage()
    showAlert("Ticket removed successfully", "success")
    render()
  }
}

// ========== UTILITY FUNCTIONS ==========
function renderTicketCard(ticket) {
  return `
        <div class="card" onclick="openTicketModal('${ticket.id}')">
            <div class="card-header">
                <div>
                    <span class="ticket-type">${ticket.type.toUpperCase()}</span>
                    <h3 class="card-title">${ticket.from} → ${ticket.to}</h3>
                    ${ticket.file ? '<span class="attachment-icon" title="Has attachment">📎</span>' : ''}
                </div>
                <span class="status ${ticket.quantity > 0 ? "status-active" : "status-sold"}">
                    ${ticket.quantity > 0 ? "Available" : "Sold"}
                </span>
            </div>
            <div class="card-meta">
                <span>📅 ${new Date(ticket.date).toLocaleDateString()}</span>
                <span>🕐 ${ticket.time}</span>
                <span>👤 ${ticket.sellerName}</span>
            </div>
            <div class="card-footer">
                <div class="price">$${ticket.price}</div>
                <span class="seller-info">${ticket.quantity} in stock</span>
            </div>
        </div>
    `
}

function renderNotLoggedIn() {
  return `
        <div class="page">
            <div class="empty-state" style="margin-top: 4rem;">
                <div class="empty-state-icon">🔒</div>
                <h3>Login Required</h3>
                <p>Please login to access this page</p>
                <button class="btn btn-primary" onclick="openAuthModal('login')">Login</button>
            </div>
        </div>
    `
}

function renderUnauthorized() {
  return `
        <div class="page">
            <div class="empty-state" style="margin-top: 4rem;">
                <div class="empty-state-icon">🚫</div>
                <h3>Access Denied</h3>
                <p>You don't have permission to access this page</p>
                <button class="btn btn-primary" onclick="navigateTo('home')">Go Home</button>
            </div>
        </div>
    `
}

function showAlert(message, type = "info") {
  const alert = document.createElement("div")
  alert.className = `alert alert-${type}`
  alert.textContent = message
  alert.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 300;
        max-width: 400px;
        animation: slideIn 0.3s ease;
    `

  document.body.appendChild(alert)
  setTimeout(() => alert.remove(), 4000)
}

// Add animation styles
const style = document.createElement("style")
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`
document.head.appendChild(style)
