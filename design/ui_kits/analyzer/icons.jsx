// Icon — renders a real Lucide icon (loaded via CDN umd as window.lucide).
// Avoids hand-rolled SVG; uses the Lucide outline set (1.75 stroke).
function Icon({ name, size = 18, color, strokeWidth = 1.75, style }) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const host = ref.current;
    if (!host || !window.lucide) return;
    host.innerHTML = "";
    const i = document.createElement("i");
    i.setAttribute("data-lucide", name);
    host.appendChild(i);
    try {
      window.lucide.createIcons({ attrs: { "stroke-width": strokeWidth } });
    } catch (e) {}
    const svg = host.querySelector("svg");
    if (svg) {
      svg.setAttribute("width", size);
      svg.setAttribute("height", size);
      svg.style.width = size + "px";
      svg.style.height = size + "px";
      svg.setAttribute("stroke-width", strokeWidth);
    }
  }, [name, size, strokeWidth]);
  return (
    <span
      ref={ref}
      aria-hidden="true"
      style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", color: color || "currentColor", lineHeight: 0, ...style }}
    />
  );
}

window.Icon = Icon;
