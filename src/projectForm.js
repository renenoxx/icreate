/**
 * Project inquiry form — frontend validation only.
 *
 * INTEGRATION POINT:
 * Replace submitProjectInquiry() with your email/API handler when ready
 * (e.g. Formspree, EmailJS, or a custom /api/contact endpoint).
 */
async function submitProjectInquiry(payload) {
  // return fetch("/api/contact", {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify(payload),
  // });
  return { ok: true, pending: true, payload };
}

function setFieldError(form, name, message) {
  const input = form.querySelector(`[name="${name}"]`);
  const error = form.querySelector(`[data-error="${name}"]`);
  input?.classList.toggle("is-invalid", Boolean(message));
  if (error) error.textContent = message || "";
}

function validateForm(form) {
  const name = form.name.value.trim();
  const email = form.email.value.trim();
  const message = form.message.value.trim();
  const company = form.company?.value.trim() || "";
  const need = form.need?.value || "";
  let valid = true;

  setFieldError(form, "name", "");
  setFieldError(form, "email", "");
  setFieldError(form, "message", "");

  if (!name) {
    setFieldError(form, "name", "Please enter your name.");
    valid = false;
  }

  if (!email) {
    setFieldError(form, "email", "Please enter your email.");
    valid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    setFieldError(form, "email", "Please enter a valid email address.");
    valid = false;
  }

  if (!message) {
    setFieldError(form, "message", "Tell us about your project.");
    valid = false;
  } else if (message.length < 12) {
    setFieldError(form, "message", "Please share a little more detail.");
    valid = false;
  }

  return valid ? { name, email, company, need, message } : null;
}

export function initProjectForm() {
  const form = document.querySelector("[data-project-form]");
  if (!form) return;

  const status = form.querySelector("[data-form-status]");
  const submitBtn = form.querySelector("[type='submit']");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const payload = validateForm(form);
    if (!payload) return;

    submitBtn.disabled = true;
    status.hidden = true;
    status.classList.remove("is-success", "is-error");

    try {
      const result = await submitProjectInquiry({
        ...payload,
        submittedAt: new Date().toISOString(),
        source: "icreate-start-project",
      });

      if (result.ok) {
        status.textContent = result.pending
          ? "Thank you. Your project details are captured — email delivery will be connected soon."
          : "Thank you. We'll be in touch shortly.";
        status.classList.add("is-success");
        form.reset();
      } else {
        throw new Error("Submission failed");
      }
    } catch {
      status.textContent =
        "Something went wrong. Please try again or reach us directly via email.";
      status.classList.add("is-error");
    } finally {
      status.hidden = false;
      submitBtn.disabled = false;
    }
  });
}
