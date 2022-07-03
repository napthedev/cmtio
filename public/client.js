(() => {
  const script = document.currentScript;

  if (!script) {
    throw new Error("[cmtio] Script is not embed correctly");
  }

  const origin = new URL(script.src).origin;
  const slug = location.pathname;
  const siteId = script.dataset.siteId || script.dataset["site-id"];
  const theme =
    script.dataset.theme === "dark"
      ? "dark"
      : script.dataset.theme === "light"
      ? "light"
      : null;
  const sorting = script.dataset.sorting === "oldest";

  if (!siteId) {
    throw new Error("[cmtio] No site id provided");
  }

  window.initCmtioIframe = (container) => {
    if (!container) {
      throw new Error("[cmtio] No container specified");
    }

    if (!container instanceof HTMLElement) {
      throw new Error("[cmtio] Container is not an HTML element");
    }

    const iframe = document.createElement("iframe");
    iframe.src = `${origin}/embed?siteId=${siteId}&slug=${slug}&theme=${
      theme || ""
    }&oldest=${Number(sorting)}`;
    iframe.style.width = "100%";
    iframe.setAttribute("frameborder", "0");

    container.appendChild(iframe);

    iframe.onload = () => {
      window.addEventListener("message", (e) => {
        if (
          e.origin !== origin ||
          e?.data?.siteId !== siteId ||
          e?.data?.slug !== slug
        )
          return;

        iframe.style.height = `${e.data.height}px`;
      });
    };
  };
})();
