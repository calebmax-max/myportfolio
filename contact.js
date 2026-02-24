(() => {
  const form = document.querySelector(".contact-form");
  if (!form) return;

  const emailBtn = document.getElementById("sendEmailBtn");
  const whatsappBtn = document.getElementById("sendWhatsAppBtn");
  const status = document.getElementById("contactStatus");
  const submitBtn = form.querySelector('button[type="submit"]');

  const API_ENDPOINT = "/api/contact";
  const DEST_EMAIL = "c.tonie2007@gmail.com";
  const WA_NUMBER = "254762220299";

  function getFormData() {
    const name = form.querySelector("#name")?.value.trim() || "";
    const phone = form.querySelector("#phone")?.value.trim() || "";
    const subject = form.querySelector("#subject")?.value.trim() || "";
    const message = form.querySelector("#message")?.value.trim() || "";
    return { name, phone, subject, message };
  }

  function isValid(data) {
    return data.name && data.phone && data.subject && data.message;
  }

  function setStatus(message, type) {
    if (!status) return;
    status.textContent = message;
    status.classList.remove("is-error", "is-success");
    if (type === "error") status.classList.add("is-error");
    if (type === "success") status.classList.add("is-success");
  }

  function buildMessage(data) {
    return [
      `Name: ${data.name}`,
      `Phone: ${data.phone}`,
      `Subject: ${data.subject}`,
      "",
      data.message
    ].join("\n");
  }

  function openEmail(data) {
    const body = encodeURIComponent(buildMessage(data));
    const subject = encodeURIComponent(`Website Inquiry: ${data.subject}`);
    window.location.href = `mailto:${DEST_EMAIL}?subject=${subject}&body=${body}`;
  }

  function openWhatsApp(data) {
    const text = encodeURIComponent(buildMessage(data));
    window.open(`https://wa.me/${WA_NUMBER}?text=${text}`, "_blank", "noopener");
  }

  async function submitToBackend(data) {
    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    const payload = await response.json().catch(() => ({}));

    if (!response.ok || !payload.ok) {
      throw new Error(payload.message || "Unable to send message right now.");
    }
  }

  function handleSend(preferred) {
    const data = getFormData();
    if (!isValid(data)) {
      form.reportValidity();
      return;
    }

    if (preferred === "whatsapp") {
      openWhatsApp(data);
      return;
    }

    openEmail(data);
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = getFormData();
    if (!isValid(data)) {
      form.reportValidity();
      return;
    }

    if (submitBtn) submitBtn.disabled = true;
    setStatus("Sending message...", "");

    try {
      await submitToBackend(data);
      setStatus("Message sent successfully. I will reply soon.", "success");
      form.reset();
    } catch (error) {
      setStatus(error.message || "Message failed. Try email or WhatsApp.", "error");
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });

  emailBtn?.addEventListener("click", () => handleSend("email"));
  whatsappBtn?.addEventListener("click", () => handleSend("whatsapp"));
})();
