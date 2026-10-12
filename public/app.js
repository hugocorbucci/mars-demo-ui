const API_BASE = "/api";
const statusEl = document.getElementById("status");
const ordersEl = document.getElementById("orders");

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.dataset.error = isError ? "true" : "false";
}

async function api(path, options) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    ...options,
  });
  const text = await res.text();
  let body;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = { raw: text };
  }
  if (!res.ok) {
    const err = new Error(body?.error || res.statusText || "Request failed");
    err.status = res.status;
    err.body = body;
    throw err;
  }
  return body;
}

async function refreshOrders() {
  const data = await api("/orders");
  ordersEl.innerHTML = "";
  if (!data.orders?.length) {
    ordersEl.innerHTML = "<li>No orders yet.</li>";
    return;
  }
  for (const order of data.orders) {
    const li = document.createElement("li");
    li.textContent = `#${order.id} · ${order.customer_email} · $${Number(order.amount_cents / 100).toFixed(2)} · ${order.status}`;
    ordersEl.appendChild(li);
  }
}

document.getElementById("btn-health").addEventListener("click", async () => {
  try {
    const health = await api("/health");
    setStatus(`API healthy\n${JSON.stringify(health, null, 2)}`);
  } catch (err) {
    setStatus(`Health check failed: ${err.message}`, true);
  }
});

document.getElementById("btn-create").addEventListener("click", async () => {
  try {
    const email = `shopper-${Date.now()}@example.com`;
    const order = await api("/orders", {
      method: "POST",
      body: JSON.stringify({
        customer_email: email,
        amount_cents: 1999 + Math.floor(Math.random() * 5000),
      }),
    });
    setStatus(`Created order #${order.id} for ${email}`);
    await refreshOrders();
  } catch (err) {
    setStatus(`Create failed: ${err.message}`, true);
  }
});

document.getElementById("btn-lookup").addEventListener("click", async () => {
  try {
    // Intentionally hits the unindexed email lookup path (latent bug scenario).
    const email = "hotpath@example.com";
    const started = performance.now();
    const result = await api(`/orders/by-email?email=${encodeURIComponent(email)}`);
    const ms = Math.round(performance.now() - started);
    setStatus(`Lookup for ${email} completed in ${ms}ms\n${JSON.stringify(result, null, 2)}`);
  } catch (err) {
    setStatus(`Lookup failed: ${err.message}`, true);
  }
});

document.getElementById("btn-stress").addEventListener("click", async () => {
  setStatus("Running 20 create requests…");
  const results = await Promise.allSettled(
    Array.from({ length: 20 }, (_, i) =>
      api("/orders", {
        method: "POST",
        body: JSON.stringify({
          customer_email: `load-${Date.now()}-${i}@example.com`,
          amount_cents: 500 + i * 10,
        }),
      })
    )
  );
  const ok = results.filter((r) => r.status === "fulfilled").length;
  const fail = results.length - ok;
  setStatus(`Load test finished: ${ok} ok, ${fail} failed`);
  try {
    await refreshOrders();
  } catch {
    /* ignore refresh errors after stress */
  }
});

refreshOrders().catch((err) => setStatus(`Initial load failed: ${err.message}`, true));
