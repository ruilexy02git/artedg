/* Static-router adapter for the existing members.html SPA.
 * The project has no server/router framework, so the member routes are represented
 * as hash URLs that work on Vercel, GitHub Pages and any static host:
 * #/membros/login, #/membros/dashboard, #/membros/curso,
 * #/membros/perfil, #/membros/admin and #/membros/acesso.
 */
(function () {
  const routes = {
    "/membros": "dashboard",
    "/membros/login": "auth",
    "/membros/dashboard": "dashboard",
    "/membros/curso": "course",
    "/membros/perfil": "profile",
    "/membros/admin": "admin",
    "/membros/acesso": "denied"
  };

  const routeFor = () => {
    const raw = window.location.hash.replace(/^#/, "") || "/membros/login";
    return routes[raw] || "auth";
  };

  const isAuthenticated = () => Boolean(window.__ARTE_MEMBER_USER || localStorage.getItem("artedg_current_user"));

  const navigate = (route) => {
    const path = Object.keys(routes).find((key) => routes[key] === route) || "/membros/login";
    if (window.location.hash !== `#${path}`) window.location.hash = path;
    render();
  };

  const render = () => {
    const target = routeFor();
    const protectedRoutes = ["dashboard", "course", "profile", "admin", "denied"];

    if (protectedRoutes.includes(target) && !isAuthenticated()) {
      navigate("auth");
      return;
    }

    if (target === "admin" && window.__ARTE_MEMBER_ROLE && window.__ARTE_MEMBER_ROLE !== "admin") {
      navigate("denied");
      return;
    }

    document.querySelectorAll(".view").forEach((view) => view.classList.remove("active"));
    const view = document.getElementById(`${target}-view`);
    if (view) view.classList.add("active");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  document.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-go]");
    if (!trigger) return;
    event.preventDefault();
    navigate(trigger.dataset.go);
  });

  window.addEventListener("hashchange", render);
  window.addEventListener("storage", render);
  window.membersNavigate = navigate;
  window.membersRouteRender = render;
  render();
})();
(function () {
  const routes = {
    "/membros/login": "auth",
    "/membros/dashboard": "dashboard",
    "/membros/curso": "course",
    "/membros/perfil": "profile",
    "/membros/admin": "admin",
    "/membros/acesso": "denied"
  };

  const routeFor = () => {
    const raw = window.location.hash.replace(/^#/, "") || "/membros/login";
    return routes[raw] || "auth";
  };

  const isAuthenticated = () => {
    return Boolean(window.__ARTE_MEMBER_USER || localStorage.getItem("artedg_current_user"));
  };

  const navigate = (route) => {
    const path = Object.keys(routes).find((key) => routes[key] === route) || "/membros/login";
    if (window.location.hash !== `#${path}`) {
      window.location.hash = path;
    }
    render();
  };

  const render = () => {
    const target = routeFor();
    const protectedRoutes = ["dashboard", "course", "profile", "admin", "denied"];

    if (protectedRoutes.includes(target) && !isAuthenticated()) {
      navigate("auth");
      return;
    }

    if (target === "admin" && window.__ARTE_MEMBER_ROLE && window.__ARTE_MEMBER_ROLE !== "admin") {
      navigate("denied");
      return;
    }

    document.querySelectorAll(".view").forEach((view) => view.classList.remove("active"));
    const view = document.getElementById(`${target}-view`);
    if (view) view.classList.add("active");

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  document.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-go]");
    if (!trigger) return;
    event.preventDefault();
    navigate(trigger.dataset.go);
  });

  window.addEventListener("hashchange", render);
  window.addEventListener("storage", render);

  window.membersNavigate = navigate;
  window.membersRouteRender = render;

  render();
})();
