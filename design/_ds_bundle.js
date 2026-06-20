/* @ds-bundle: {"format":3,"namespace":"TechnicalMaturityAnalyzerDesignSystem_3be3ec","components":[{"name":"Avatar","sourcePath":"components/core/Avatar.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"Banner","sourcePath":"components/feedback/Banner.jsx"},{"name":"StageItem","sourcePath":"components/feedback/StageItem.jsx"},{"name":"StatusBadge","sourcePath":"components/feedback/StatusBadge.jsx"},{"name":"Field","sourcePath":"components/forms/Field.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"SegmentedControl","sourcePath":"components/forms/SegmentedControl.jsx"},{"name":"Tag","sourcePath":"components/forms/Tag.jsx"},{"name":"Textarea","sourcePath":"components/forms/Textarea.jsx"},{"name":"QuadrantCard","sourcePath":"components/recruiting/QuadrantCard.jsx"},{"name":"QualBadge","sourcePath":"components/recruiting/QualBadge.jsx"},{"name":"SourceCard","sourcePath":"components/recruiting/SourceCard.jsx"},{"name":"StarQuestion","sourcePath":"components/recruiting/StarQuestion.jsx"}],"sourceHashes":{"components/core/Avatar.jsx":"997f606368bc","components/core/Button.jsx":"ff847d437546","components/core/Card.jsx":"2c344ac5f9f6","components/feedback/Banner.jsx":"9ff3006bfd91","components/feedback/StageItem.jsx":"c425d788310b","components/feedback/StatusBadge.jsx":"850d126216ff","components/forms/Field.jsx":"82c6611644b7","components/forms/Input.jsx":"2751f3330c7e","components/forms/SegmentedControl.jsx":"5636fc016ae1","components/forms/Tag.jsx":"c3e8098dca74","components/forms/Textarea.jsx":"9a822ca367fd","components/recruiting/QuadrantCard.jsx":"0c6c2d243cee","components/recruiting/QualBadge.jsx":"7adede25a444","components/recruiting/SourceCard.jsx":"c89d17b35a6a","components/recruiting/StarQuestion.jsx":"4646b76ced64","ui_kits/analyzer/AnalysisProgressScreen.jsx":"ead0d99ed2c6","ui_kits/analyzer/AppShell.jsx":"3f9a7fa0e688","ui_kits/analyzer/CandidateEvidenceScreen.jsx":"fbfb46bab351","ui_kits/analyzer/JobInputScreen.jsx":"59e06d46a277","ui_kits/analyzer/ReportScreen.jsx":"6366a4868187","ui_kits/analyzer/icons.jsx":"ebb5c1ab13a7"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.TechnicalMaturityAnalyzerDesignSystem_3be3ec = window.TechnicalMaturityAnalyzerDesignSystem_3be3ec || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Avatar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Avatar — candidate / recruiter identity chip. Initials by default,
 * image when src is provided. Calm neutral fill.
 */
function Avatar({
  name = "",
  src = null,
  size = 36,
  style,
  ...rest
}) {
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]?.toUpperCase()).join("");
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: size,
      height: size,
      borderRadius: "var(--radius-md)",
      background: src ? "transparent" : "var(--surface-sunken)",
      border: "1px solid var(--border-subtle)",
      color: "var(--text-secondary)",
      fontFamily: "var(--font-mono)",
      fontSize: Math.max(11, Math.round(size * 0.36)),
      fontWeight: "var(--weight-semibold)",
      letterSpacing: "0.02em",
      overflow: "hidden",
      flex: "none",
      ...style
    }
  }, rest), src ? /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: name,
    style: {
      width: "100%",
      height: "100%",
      objectFit: "cover"
    }
  }) : initials || "?");
}
Object.assign(__ds_scope, { Avatar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Avatar.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Button — primary action control for the analyzer.
 * Variants: primary (ink), accent (calm blue), secondary (outline),
 * ghost (text), subtle (tinted), danger-quiet (muted clay).
 */
function Button({
  variant = "secondary",
  size = "md",
  fullWidth = false,
  disabled = false,
  loading = false,
  leadingIcon = null,
  trailingIcon = null,
  type = "button",
  onClick,
  children,
  style,
  ...rest
}) {
  const sizes = {
    sm: {
      padding: "0 10px",
      height: 30,
      font: "var(--text-sm)",
      gap: 6,
      radius: "var(--radius-sm)"
    },
    md: {
      padding: "0 14px",
      height: 36,
      font: "var(--text-base)",
      gap: 8,
      radius: "var(--radius-md)"
    },
    lg: {
      padding: "0 18px",
      height: 44,
      font: "var(--text-md)",
      gap: 8,
      radius: "var(--radius-md)"
    }
  };
  const s = sizes[size] || sizes.md;
  const variants = {
    primary: {
      background: "var(--surface-inverse)",
      color: "var(--text-inverse)",
      border: "1px solid var(--surface-inverse)"
    },
    accent: {
      background: "var(--accent)",
      color: "var(--text-inverse)",
      border: "1px solid var(--accent)"
    },
    secondary: {
      background: "var(--surface-card)",
      color: "var(--text-primary)",
      border: "1px solid var(--border-default)"
    },
    subtle: {
      background: "var(--surface-sunken)",
      color: "var(--text-primary)",
      border: "1px solid transparent"
    },
    ghost: {
      background: "transparent",
      color: "var(--text-secondary)",
      border: "1px solid transparent"
    },
    "danger-quiet": {
      background: "var(--status-gap-bg)",
      color: "var(--status-gap-fg)",
      border: "1px solid var(--status-gap-border)"
    }
  };
  const v = variants[variant] || variants.secondary;
  return /*#__PURE__*/React.createElement("button", _extends({
    type: type,
    disabled: disabled || loading,
    onClick: onClick,
    style: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: s.gap,
      height: s.height,
      padding: s.padding,
      width: fullWidth ? "100%" : "auto",
      fontFamily: "var(--font-sans)",
      fontSize: s.font,
      fontWeight: "var(--weight-medium)",
      lineHeight: 1,
      letterSpacing: "var(--tracking-normal)",
      borderRadius: s.radius,
      cursor: disabled || loading ? "not-allowed" : "pointer",
      opacity: disabled ? 0.5 : 1,
      whiteSpace: "nowrap",
      transition: "background var(--duration-fast) var(--ease-standard), border-color var(--duration-fast) var(--ease-standard), box-shadow var(--duration-fast) var(--ease-standard)",
      ...v,
      ...style
    }
  }, rest), loading && /*#__PURE__*/React.createElement(Spinner, null), !loading && leadingIcon, children && /*#__PURE__*/React.createElement("span", null, children), !loading && trailingIcon);
}
function Spinner() {
  return /*#__PURE__*/React.createElement("span", {
    "aria-hidden": true,
    style: {
      width: 13,
      height: 13,
      borderRadius: "50%",
      border: "2px solid currentColor",
      borderTopColor: "transparent",
      opacity: 0.85,
      animation: "tma-spin 0.7s linear infinite",
      display: "inline-block"
    }
  });
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Card — soft panel surface. The primary container for the analyzer.
 * tones: default (white), sunken (recessed), and quad tones tinted to status.
 */
function Card({
  tone = "default",
  padding = "md",
  interactive = false,
  as = "div",
  children,
  style,
  ...rest
}) {
  const pads = {
    none: 0,
    sm: "var(--space-3)",
    md: "var(--space-4)",
    lg: "var(--space-6)"
  };
  const tones = {
    default: {
      background: "var(--surface-card)",
      border: "1px solid var(--border-subtle)"
    },
    sunken: {
      background: "var(--surface-sunken)",
      border: "1px solid var(--border-subtle)"
    },
    confirmed: {
      background: "var(--status-confirmed-bg)",
      border: "1px solid var(--status-confirmed-border)"
    },
    validate: {
      background: "var(--status-validate-bg)",
      border: "1px solid var(--status-validate-border)"
    },
    gap: {
      background: "var(--status-gap-bg)",
      border: "1px solid var(--status-gap-border)"
    },
    uncertain: {
      background: "var(--status-uncertain-bg)",
      border: "1px solid var(--status-uncertain-border)"
    }
  };
  const t = tones[tone] || tones.default;
  const Tag = as;
  return /*#__PURE__*/React.createElement(Tag, _extends({
    style: {
      borderRadius: "var(--radius-lg)",
      padding: pads[padding] ?? pads.md,
      boxShadow: tone === "default" ? "var(--shadow-xs)" : "none",
      transition: "box-shadow var(--duration-base) var(--ease-standard), border-color var(--duration-base) var(--ease-standard)",
      cursor: interactive ? "pointer" : "default",
      ...t,
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Banner.jsx
try { (() => {
/**
 * Banner — calm inline info / privacy / warning notice. Used for the
 * "files processed for this analysis only" privacy note and the
 * "does not make a hiring decision" methodology note.
 */
function Banner({
  tone = "info",
  icon = null,
  title,
  children,
  style
}) {
  const map = {
    info: {
      fg: "var(--status-info-fg)",
      bg: "var(--status-info-bg)",
      bd: "var(--status-info-border)"
    },
    validate: {
      fg: "var(--status-validate-fg)",
      bg: "var(--status-validate-bg)",
      bd: "var(--status-validate-border)"
    },
    neutral: {
      fg: "var(--text-secondary)",
      bg: "var(--surface-sunken)",
      bd: "var(--border-subtle)"
    }
  };
  const c = map[tone] || map.info;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      padding: "12px 14px",
      background: c.bg,
      border: `1px solid ${c.bd}`,
      borderRadius: "var(--radius-md)",
      ...style
    }
  }, icon && /*#__PURE__*/React.createElement("span", {
    style: {
      color: c.fg,
      flex: "none",
      display: "inline-flex",
      marginTop: 1
    }
  }, icon), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 2,
      minWidth: 0
    }
  }, title && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-sm)",
      fontWeight: "var(--weight-semibold)",
      color: c.fg
    }
  }, title), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--text-xs)",
      color: "var(--text-secondary)",
      lineHeight: "var(--leading-snug)"
    }
  }, children)));
}
Object.assign(__ds_scope, { Banner });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Banner.jsx", error: String((e && e.message) || e) }); }

// components/feedback/StageItem.jsx
try { (() => {
/**
 * StageItem — one row in the analysis-progress timeline.
 * States: pending · running · completed · warning · failed.
 * `last` removes the connector line below the node.
 */
function StageItem({
  state = "pending",
  title,
  detail,
  duration,
  last = false,
  style
}) {
  const map = {
    pending: {
      ring: "var(--border-default)",
      fill: "var(--surface-card)",
      text: "var(--text-muted)",
      icon: null
    },
    running: {
      ring: "var(--accent)",
      fill: "var(--surface-card)",
      text: "var(--text-primary)",
      icon: "spin"
    },
    completed: {
      ring: "var(--status-confirmed-solid)",
      fill: "var(--status-confirmed-solid)",
      text: "var(--text-primary)",
      icon: "check"
    },
    warning: {
      ring: "var(--status-validate-solid)",
      fill: "var(--status-validate-solid)",
      text: "var(--text-primary)",
      icon: "warn"
    },
    failed: {
      ring: "var(--status-gap-solid)",
      fill: "var(--status-gap-solid)",
      text: "var(--text-primary)",
      icon: "x"
    }
  };
  const c = map[state] || map.pending;
  const filled = state === "completed" || state === "warning" || state === "failed";
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 12,
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      flex: "none"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: "relative",
      width: 20,
      height: 20,
      borderRadius: "50%",
      border: `2px solid ${c.ring}`,
      background: filled ? c.fill : c.fill,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      color: filled ? "var(--text-inverse)" : c.ring
    }
  }, c.icon === "spin" && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 9,
      height: 9,
      borderRadius: "50%",
      border: "2px solid var(--accent)",
      borderTopColor: "transparent",
      animation: "tma-spin 0.7s linear infinite"
    }
  }), c.icon === "check" && /*#__PURE__*/React.createElement(Glyph, {
    d: "M3 7.2 5.6 10 11 3.6"
  }), c.icon === "x" && /*#__PURE__*/React.createElement(Glyph, {
    d: "M3.5 3.5l7 7M10.5 3.5l-7 7"
  }), c.icon === "warn" && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 11,
      fontWeight: 700,
      lineHeight: 1
    }
  }, "!")), !last && /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      width: 2,
      minHeight: 22,
      marginTop: 2,
      background: filled ? "var(--status-confirmed-border)" : "var(--border-subtle)"
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      paddingBottom: last ? 0 : 16,
      minWidth: 0,
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "baseline",
      justifyContent: "space-between",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-base)",
      fontWeight: state === "running" ? "var(--weight-semibold)" : "var(--weight-medium)",
      color: c.text
    }
  }, title), duration && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: "var(--text-2xs)",
      color: "var(--text-muted)",
      flex: "none"
    }
  }, duration)), detail && /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "2px 0 0",
      fontSize: "var(--text-xs)",
      color: "var(--text-secondary)",
      lineHeight: "var(--leading-snug)"
    }
  }, detail)));
}
function Glyph({
  d
}) {
  return /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: d
  }));
}
Object.assign(__ds_scope, { StageItem });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/StageItem.jsx", error: String((e && e.message) || e) }); }

// components/feedback/StatusBadge.jsx
try { (() => {
/**
 * StatusBadge — restrained qualitative chip. The vocabulary of the
 * analyzer: confirmed / validate / gap / uncertain / info / neutral.
 * Careful wording lives in `children`; tone sets the muted color.
 */
function StatusBadge({
  tone = "neutral",
  variant = "soft",
  dot = true,
  size = "md",
  children,
  style
}) {
  const map = {
    confirmed: {
      fg: "var(--status-confirmed-fg)",
      bg: "var(--status-confirmed-bg)",
      bd: "var(--status-confirmed-border)",
      solid: "var(--status-confirmed-solid)"
    },
    validate: {
      fg: "var(--status-validate-fg)",
      bg: "var(--status-validate-bg)",
      bd: "var(--status-validate-border)",
      solid: "var(--status-validate-solid)"
    },
    gap: {
      fg: "var(--status-gap-fg)",
      bg: "var(--status-gap-bg)",
      bd: "var(--status-gap-border)",
      solid: "var(--status-gap-solid)"
    },
    uncertain: {
      fg: "var(--status-uncertain-fg)",
      bg: "var(--status-uncertain-bg)",
      bd: "var(--status-uncertain-border)",
      solid: "var(--status-uncertain-solid)"
    },
    info: {
      fg: "var(--status-info-fg)",
      bg: "var(--status-info-bg)",
      bd: "var(--status-info-border)",
      solid: "var(--status-info-solid)"
    },
    neutral: {
      fg: "var(--text-secondary)",
      bg: "var(--surface-sunken)",
      bd: "var(--border-subtle)",
      solid: "var(--neutral-400)"
    }
  };
  const c = map[tone] || map.neutral;
  const pad = size === "sm" ? "2px 8px" : "3px 10px";
  const font = size === "sm" ? "var(--text-2xs)" : "var(--text-xs)";
  const styles = variant === "outline" ? {
    background: "transparent",
    color: c.fg,
    border: `1px solid ${c.bd}`
  } : variant === "solid" ? {
    background: c.solid,
    color: "var(--text-inverse)",
    border: `1px solid ${c.solid}`
  } : {
    background: c.bg,
    color: c.fg,
    border: `1px solid ${c.bd}`
  };
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      padding: pad,
      fontFamily: "var(--font-sans)",
      fontSize: font,
      fontWeight: "var(--weight-medium)",
      lineHeight: 1.3,
      borderRadius: "var(--radius-sm)",
      whiteSpace: "nowrap",
      ...styles,
      ...style
    }
  }, dot && variant !== "solid" && /*#__PURE__*/React.createElement("span", {
    "aria-hidden": true,
    style: {
      width: 6,
      height: 6,
      borderRadius: "50%",
      background: c.solid,
      flex: "none"
    }
  }), children);
}
Object.assign(__ds_scope, { StatusBadge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/StatusBadge.jsx", error: String((e && e.message) || e) }); }

// components/forms/Field.jsx
try { (() => {
/**
 * Field — label + control wrapper with optional hint, required mark,
 * and optional/required tag. Used by Input, Textarea, Select.
 */
function Field({
  label,
  htmlFor,
  hint,
  required = false,
  optional = false,
  children,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 6,
      ...style
    }
  }, (label || optional) && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "baseline",
      justifyContent: "space-between",
      gap: 8
    }
  }, label && /*#__PURE__*/React.createElement("label", {
    htmlFor: htmlFor,
    style: {
      fontSize: "var(--text-sm)",
      fontWeight: "var(--weight-medium)",
      color: "var(--text-primary)"
    }
  }, label, required && /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--status-gap-solid)",
      marginLeft: 3
    }
  }, "*")), optional && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: "var(--text-2xs)",
      letterSpacing: "var(--tracking-label)",
      textTransform: "uppercase",
      color: "var(--text-muted)"
    }
  }, "Optional")), children, hint && /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: "var(--text-xs)",
      color: "var(--text-muted)",
      lineHeight: "var(--leading-snug)"
    }
  }, hint));
}
Object.assign(__ds_scope, { Field });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Field.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const baseControl = {
  width: "100%",
  fontFamily: "var(--font-sans)",
  fontSize: "var(--text-base)",
  color: "var(--text-primary)",
  background: "var(--surface-card)",
  border: "1px solid var(--border-default)",
  borderRadius: "var(--radius-md)",
  transition: "border-color var(--duration-fast) var(--ease-standard), box-shadow var(--duration-fast) var(--ease-standard)",
  outline: "none"
};

/**
 * Input — single-line text/number/url field. Leading adornment optional.
 */
function Input({
  size = "md",
  invalid = false,
  leading = null,
  style,
  ...rest
}) {
  const heights = {
    sm: 30,
    md: 36,
    lg: 44
  };
  const [focused, setFocused] = React.useState(false);
  const control = /*#__PURE__*/React.createElement("input", _extends({}, rest, {
    onFocus: e => {
      setFocused(true);
      rest.onFocus?.(e);
    },
    onBlur: e => {
      setFocused(false);
      rest.onBlur?.(e);
    },
    style: {
      ...baseControl,
      height: heights[size] || heights.md,
      padding: leading ? "0 12px 0 34px" : "0 12px",
      borderColor: invalid ? "var(--status-gap-solid)" : focused ? "var(--accent)" : "var(--border-default)",
      boxShadow: focused ? "var(--shadow-focus)" : "none",
      ...style
    }
  }));
  if (!leading) return control;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      display: "flex",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      left: 11,
      display: "inline-flex",
      color: "var(--text-muted)",
      pointerEvents: "none"
    }
  }, leading), control);
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/forms/SegmentedControl.jsx
try { (() => {
/**
 * SegmentedControl — single-select inline switch. Used for the
 * seniority baseline (Intern · Junior · Mid · Senior · Staff).
 */
function SegmentedControl({
  options = [],
  value,
  onChange,
  size = "md",
  style
}) {
  const heights = {
    sm: 30,
    md: 36
  };
  const h = heights[size] || heights.md;
  return /*#__PURE__*/React.createElement("div", {
    role: "tablist",
    style: {
      display: "inline-flex",
      padding: 3,
      gap: 2,
      background: "var(--surface-sunken)",
      border: "1px solid var(--border-subtle)",
      borderRadius: "var(--radius-md)",
      ...style
    }
  }, options.map(opt => {
    const val = typeof opt === "string" ? opt : opt.value;
    const label = typeof opt === "string" ? opt : opt.label;
    const active = val === value;
    return /*#__PURE__*/React.createElement("button", {
      key: val,
      role: "tab",
      "aria-selected": active,
      onClick: () => onChange?.(val),
      style: {
        height: h - 6,
        padding: "0 12px",
        border: "none",
        borderRadius: "var(--radius-sm)",
        background: active ? "var(--surface-card)" : "transparent",
        color: active ? "var(--text-primary)" : "var(--text-secondary)",
        fontFamily: "var(--font-sans)",
        fontSize: "var(--text-sm)",
        fontWeight: active ? "var(--weight-semibold)" : "var(--weight-medium)",
        boxShadow: active ? "var(--shadow-xs)" : "none",
        cursor: "pointer",
        whiteSpace: "nowrap",
        transition: "background var(--duration-fast) var(--ease-standard), color var(--duration-fast) var(--ease-standard)"
      }
    }, label);
  }));
}
Object.assign(__ds_scope, { SegmentedControl });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/SegmentedControl.jsx", error: String((e && e.message) || e) }); }

// components/forms/Tag.jsx
try { (() => {
/**
 * Tag — stack / skill chip. Can be marked `primary` (one of up to 3
 * primary stacks that guide the analysis) and optionally removable.
 */
function Tag({
  children,
  primary = false,
  removable = false,
  onRemove,
  onClick,
  size = "md",
  style
}) {
  const pad = size === "sm" ? "2px 8px" : "4px 10px";
  const font = size === "sm" ? "var(--text-xs)" : "var(--text-sm)";
  return /*#__PURE__*/React.createElement("span", {
    onClick: onClick,
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      padding: pad,
      fontFamily: "var(--font-mono)",
      fontSize: font,
      fontWeight: "var(--weight-medium)",
      lineHeight: 1.4,
      borderRadius: "var(--radius-pill)",
      cursor: onClick ? "pointer" : "default",
      background: primary ? "var(--accent-subtle)" : "var(--surface-sunken)",
      color: primary ? "var(--accent-active)" : "var(--text-secondary)",
      border: primary ? "1px solid var(--blue-200)" : "1px solid var(--border-subtle)",
      whiteSpace: "nowrap",
      ...style
    }
  }, primary && /*#__PURE__*/React.createElement("span", {
    "aria-hidden": true,
    style: {
      width: 5,
      height: 5,
      borderRadius: "50%",
      background: "var(--accent)",
      flex: "none"
    }
  }), children, removable && /*#__PURE__*/React.createElement("button", {
    onClick: e => {
      e.stopPropagation();
      onRemove?.();
    },
    "aria-label": "Remove",
    style: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: 14,
      height: 14,
      marginRight: -2,
      border: "none",
      background: "transparent",
      color: "currentColor",
      opacity: 0.6,
      cursor: "pointer",
      fontSize: 14,
      lineHeight: 1,
      padding: 0
    }
  }, "\xD7"));
}
Object.assign(__ds_scope, { Tag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Tag.jsx", error: String((e && e.message) || e) }); }

// components/forms/Textarea.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Textarea — multi-line input for job descriptions, pasted resume / LinkedIn
 * text, and recruiter notes. Optional character counter.
 */
function Textarea({
  rows = 6,
  invalid = false,
  value,
  maxLength,
  showCount = false,
  style,
  ...rest
}) {
  const [focused, setFocused] = React.useState(false);
  const count = typeof value === "string" ? value.length : 0;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement("textarea", _extends({
    rows: rows,
    value: value,
    maxLength: maxLength
  }, rest, {
    onFocus: e => {
      setFocused(true);
      rest.onFocus?.(e);
    },
    onBlur: e => {
      setFocused(false);
      rest.onBlur?.(e);
    },
    style: {
      width: "100%",
      fontFamily: "var(--font-sans)",
      fontSize: "var(--text-base)",
      lineHeight: "var(--leading-normal)",
      color: "var(--text-primary)",
      background: "var(--surface-card)",
      border: "1px solid",
      borderColor: invalid ? "var(--status-gap-solid)" : focused ? "var(--accent)" : "var(--border-default)",
      borderRadius: "var(--radius-md)",
      padding: "10px 12px",
      resize: "vertical",
      outline: "none",
      boxShadow: focused ? "var(--shadow-focus)" : "none",
      transition: "border-color var(--duration-fast) var(--ease-standard), box-shadow var(--duration-fast) var(--ease-standard)",
      ...style
    }
  })), showCount && maxLength && /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      right: 10,
      bottom: 8,
      fontFamily: "var(--font-mono)",
      fontSize: "var(--text-2xs)",
      color: "var(--text-muted)"
    }
  }, count, "/", maxLength));
}
Object.assign(__ds_scope, { Textarea });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Textarea.jsx", error: String((e && e.message) || e) }); }

// components/recruiting/QuadrantCard.jsx
try { (() => {
const QUAD = {
  strong_with_evidence: {
    label: "Strong with evidence",
    tone: "confirmed"
  },
  strong_needs_validation: {
    label: "Strong but needs validation",
    tone: "validate"
  },
  weak_with_evidence: {
    label: "Weak with evidence",
    tone: "gap"
  },
  weak_needs_validation: {
    label: "Weak but needs validation",
    tone: "uncertain"
  }
};
const TONE = {
  confirmed: {
    fg: "var(--status-confirmed-fg)",
    bg: "var(--status-confirmed-bg)",
    bd: "var(--status-confirmed-border)",
    solid: "var(--status-confirmed-solid)"
  },
  validate: {
    fg: "var(--status-validate-fg)",
    bg: "var(--status-validate-bg)",
    bd: "var(--status-validate-border)",
    solid: "var(--status-validate-solid)"
  },
  gap: {
    fg: "var(--status-gap-fg)",
    bg: "var(--status-gap-bg)",
    bd: "var(--status-gap-border)",
    solid: "var(--status-gap-solid)"
  },
  uncertain: {
    fg: "var(--status-uncertain-fg)",
    bg: "var(--status-uncertain-bg)",
    bd: "var(--status-uncertain-border)",
    solid: "var(--status-uncertain-solid)"
  }
};

/**
 * QuadrantCard — one finding in the 2x2 evidence matrix. Carries the
 * quadrant label, a short title, the evidence source, rationale, and an
 * interview-focus prompt. This is the visual center of the report.
 */
function QuadrantCard({
  quadrant = "strong_with_evidence",
  title,
  source,
  rationale,
  interviewFocus,
  style
}) {
  const q = QUAD[quadrant] || QUAD.strong_with_evidence;
  const c = TONE[q.tone];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 10,
      padding: "var(--space-4)",
      background: "var(--surface-card)",
      border: `1px solid var(--border-subtle)`,
      borderTop: `3px solid ${c.solid}`,
      borderRadius: "var(--radius-lg)",
      boxShadow: "var(--shadow-xs)",
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      padding: "2px 8px",
      fontSize: "var(--text-2xs)",
      fontFamily: "var(--font-mono)",
      fontWeight: "var(--weight-semibold)",
      letterSpacing: "var(--tracking-label)",
      textTransform: "uppercase",
      color: c.fg,
      background: c.bg,
      border: `1px solid ${c.bd}`,
      borderRadius: "var(--radius-sm)"
    }
  }, q.label)), /*#__PURE__*/React.createElement("h4", {
    style: {
      margin: 0,
      fontSize: "var(--text-md)",
      fontWeight: "var(--weight-semibold)",
      color: "var(--text-primary)",
      lineHeight: "var(--leading-snug)"
    }
  }, title), source && /*#__PURE__*/React.createElement(Row, {
    label: "Evidence"
  }, source), rationale && /*#__PURE__*/React.createElement(Row, {
    label: "Rationale"
  }, rationale), interviewFocus && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 3,
      marginTop: 2,
      padding: "8px 10px",
      background: "var(--surface-sunken)",
      borderRadius: "var(--radius-sm)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: "var(--text-2xs)",
      letterSpacing: "var(--tracking-label)",
      textTransform: "uppercase",
      color: "var(--text-muted)"
    }
  }, "Interview focus"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-sm)",
      color: "var(--text-primary)",
      lineHeight: "var(--leading-snug)"
    }
  }, interviewFocus)));
}
function Row({
  label,
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 2
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: "var(--text-2xs)",
      letterSpacing: "var(--tracking-label)",
      textTransform: "uppercase",
      color: "var(--text-muted)"
    }
  }, label), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-sm)",
      color: "var(--text-secondary)",
      lineHeight: "var(--leading-normal)"
    }
  }, children));
}
Object.assign(__ds_scope, { QuadrantCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/recruiting/QuadrantCard.jsx", error: String((e && e.message) || e) }); }

// components/recruiting/QualBadge.jsx
try { (() => {
/**
 * QualBadge — a labeled qualitative signal for the report header
 * (Seniority Signal, Stack Evidence, Project Depth, …). Carries a label,
 * a short qualitative value, and a muted status tone. Never numeric.
 */
function QualBadge({
  label,
  value,
  tone = "neutral",
  style
}) {
  const map = {
    confirmed: {
      fg: "var(--status-confirmed-fg)",
      solid: "var(--status-confirmed-solid)"
    },
    validate: {
      fg: "var(--status-validate-fg)",
      solid: "var(--status-validate-solid)"
    },
    gap: {
      fg: "var(--status-gap-fg)",
      solid: "var(--status-gap-solid)"
    },
    uncertain: {
      fg: "var(--status-uncertain-fg)",
      solid: "var(--status-uncertain-solid)"
    },
    info: {
      fg: "var(--status-info-fg)",
      solid: "var(--status-info-solid)"
    },
    neutral: {
      fg: "var(--text-secondary)",
      solid: "var(--neutral-400)"
    }
  };
  const c = map[tone] || map.neutral;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 5,
      padding: "12px 14px",
      background: "var(--surface-card)",
      border: "1px solid var(--border-subtle)",
      borderRadius: "var(--radius-md)",
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    "aria-hidden": true,
    style: {
      width: 7,
      height: 7,
      borderRadius: "50%",
      background: c.solid,
      flex: "none"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: "var(--text-2xs)",
      letterSpacing: "var(--tracking-label)",
      textTransform: "uppercase",
      color: "var(--text-muted)"
    }
  }, label)), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-sm)",
      fontWeight: "var(--weight-medium)",
      color: "var(--text-primary)",
      lineHeight: "var(--leading-snug)"
    }
  }, value));
}
Object.assign(__ds_scope, { QualBadge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/recruiting/QualBadge.jsx", error: String((e && e.message) || e) }); }

// components/recruiting/SourceCard.jsx
try { (() => {
/**
 * SourceCard — an evidence-input card on the candidate screen
 * (resume, LinkedIn export, GitHub, portfolio, notes). Shows a required
 * vs optional tag and an empty / filled state.
 */
function SourceCard({
  icon = null,
  title,
  description,
  required = false,
  filled = false,
  meta,
  action,
  children,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 12,
      padding: "var(--space-4)",
      background: "var(--surface-card)",
      border: `1px solid ${filled ? "var(--status-confirmed-border)" : "var(--border-subtle)"}`,
      borderRadius: "var(--radius-lg)",
      boxShadow: "var(--shadow-xs)",
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-start",
      gap: 12
    }
  }, icon && /*#__PURE__*/React.createElement("span", {
    style: {
      flex: "none",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: 36,
      height: 36,
      borderRadius: "var(--radius-md)",
      background: filled ? "var(--status-confirmed-bg)" : "var(--surface-sunken)",
      color: filled ? "var(--status-confirmed-fg)" : "var(--text-secondary)",
      border: "1px solid var(--border-subtle)"
    }
  }, icon), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-base)",
      fontWeight: "var(--weight-semibold)",
      color: "var(--text-primary)"
    }
  }, title), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: "var(--text-2xs)",
      letterSpacing: "var(--tracking-label)",
      textTransform: "uppercase",
      color: required ? "var(--status-gap-fg)" : "var(--text-muted)"
    }
  }, required ? "Required" : "Optional")), description && /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "2px 0 0",
      fontSize: "var(--text-xs)",
      color: "var(--text-secondary)",
      lineHeight: "var(--leading-snug)"
    }
  }, description)), filled && /*#__PURE__*/React.createElement("span", {
    "aria-hidden": true,
    style: {
      flex: "none",
      color: "var(--status-confirmed-solid)",
      display: "inline-flex"
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "18",
    viewBox: "0 0 18 18",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M4 9.2 7.4 12.5 14 5.5"
  })))), children, (meta || action) && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10
    }
  }, meta && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: "var(--text-xs)",
      color: "var(--text-muted)"
    }
  }, meta), action));
}
Object.assign(__ds_scope, { SourceCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/recruiting/SourceCard.jsx", error: String((e && e.message) || e) }); }

// components/recruiting/StarQuestion.jsx
try { (() => {
/**
 * StarQuestion — a copy-friendly STAR interview question with optional
 * follow-ups and a "what a good answer reveals" note.
 */
function StarQuestion({
  index,
  question,
  followUps = [],
  reveals,
  style
}) {
  const [copied, setCopied] = React.useState(false);
  const copy = () => {
    const text = [question, followUps.length ? "\nFollow-ups:\n" + followUps.map(f => `- ${f}`).join("\n") : ""].join("");
    try {
      navigator.clipboard?.writeText(text.trim());
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch (e) {}
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 10,
      padding: "var(--space-4)",
      background: "var(--surface-card)",
      border: "1px solid var(--border-subtle)",
      borderRadius: "var(--radius-lg)",
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 12,
      alignItems: "flex-start"
    }
  }, index != null && /*#__PURE__*/React.createElement("span", {
    style: {
      flex: "none",
      fontFamily: "var(--font-mono)",
      fontSize: "var(--text-sm)",
      fontWeight: "var(--weight-semibold)",
      color: "var(--text-muted)",
      lineHeight: "var(--leading-snug)",
      minWidth: 22
    }
  }, String(index).padStart(2, "0")), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: "var(--text-md)",
      color: "var(--text-primary)",
      lineHeight: "var(--leading-normal)",
      flex: 1
    }
  }, question), /*#__PURE__*/React.createElement("button", {
    onClick: copy,
    "aria-label": "Copy question",
    style: {
      flex: "none",
      display: "inline-flex",
      alignItems: "center",
      gap: 5,
      height: 28,
      padding: "0 10px",
      border: "1px solid var(--border-default)",
      background: "var(--surface-card)",
      borderRadius: "var(--radius-sm)",
      color: copied ? "var(--status-confirmed-fg)" : "var(--text-secondary)",
      fontFamily: "var(--font-sans)",
      fontSize: "var(--text-xs)",
      fontWeight: "var(--weight-medium)",
      cursor: "pointer"
    }
  }, copied ? "Copied" : "Copy")), followUps.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 6,
      paddingLeft: index != null ? 34 : 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: "var(--text-2xs)",
      letterSpacing: "var(--tracking-label)",
      textTransform: "uppercase",
      color: "var(--text-muted)"
    }
  }, "Follow-ups"), /*#__PURE__*/React.createElement("ul", {
    style: {
      margin: 0,
      paddingLeft: 16,
      display: "flex",
      flexDirection: "column",
      gap: 4
    }
  }, followUps.map((f, i) => /*#__PURE__*/React.createElement("li", {
    key: i,
    style: {
      fontSize: "var(--text-sm)",
      color: "var(--text-secondary)",
      lineHeight: "var(--leading-snug)"
    }
  }, f)))), reveals && /*#__PURE__*/React.createElement("div", {
    style: {
      paddingLeft: index != null ? 34 : 0,
      fontSize: "var(--text-xs)",
      color: "var(--text-muted)",
      lineHeight: "var(--leading-snug)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: "var(--weight-medium)",
      color: "var(--text-secondary)"
    }
  }, "A good answer reveals: "), reveals));
}
Object.assign(__ds_scope, { StarQuestion });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/recruiting/StarQuestion.jsx", error: String((e && e.message) || e) }); }

// ui_kits/analyzer/AnalysisProgressScreen.jsx
try { (() => {
// Screen 3 — Analysis Progress. Shows the agentic workflow in progress.
const STAGES = [{
  title: "Parsing resume",
  detail: "Extracting structured claims from resume.pdf",
  dur: "1.2s"
}, {
  title: "Extracting role maturity profile",
  detail: "Mapping required vs desirable signals for Mid-level",
  dur: "0.8s"
}, {
  title: "Reading LinkedIn evidence",
  detail: "Comparing self-reported experience with resume",
  dur: "1.0s"
}, {
  title: "Analyzing GitHub repositories",
  detail: "3 public, non-empty repos · languages, structure, tests, CI",
  dur: "3.4s"
}, {
  title: "Reading portfolio signals",
  detail: "Portfolio not provided — treated as an open question",
  dur: "0.3s",
  end: "warning"
}, {
  title: "Checking claims against evidence",
  detail: "Confirming, flagging, and marking items for validation",
  dur: "2.1s"
}, {
  title: "Building evidence matrix",
  detail: "Placing findings across the four quadrants",
  dur: "1.5s"
}, {
  title: "Generating STAR questions",
  detail: "Interview prompts from matrix gaps",
  dur: "1.8s"
}, {
  title: "Running analyst self-review",
  detail: "Checking that no gap is read as a verdict",
  dur: "1.1s"
}, {
  title: "Finalizing report",
  detail: "Assembling recruiter and hiring-manager summaries",
  dur: "0.6s"
}];
function AnalysisProgressScreen({
  onComplete
}) {
  const {
    StageItem,
    Banner,
    Card,
    Button,
    Avatar,
    StatusBadge
  } = window.TechnicalMaturityAnalyzerDesignSystem_3be3ec;
  const [active, setActive] = React.useState(0); // index currently running; === length when done

  React.useEffect(() => {
    if (active >= STAGES.length) return;
    const t = setTimeout(() => setActive(a => a + 1), active === 3 ? 1700 : 950);
    return () => clearTimeout(t);
  }, [active]);
  const done = active >= STAGES.length;
  const stateFor = i => {
    if (i < active) return STAGES[i].end || "completed";
    if (i === active) return "running";
    return "pending";
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 880,
      margin: "0 auto",
      display: "flex",
      flexDirection: "column",
      gap: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 16,
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      fontSize: "var(--text-2xl)",
      fontWeight: 600,
      letterSpacing: "-0.01em"
    }
  }, done ? "Analysis complete" : "Analyzing technical maturity"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "6px 0 0",
      fontSize: "var(--text-md)",
      color: "var(--text-secondary)"
    }
  }, "Marina Alvarez \xB7 Full-stack Engineer (Mid-level baseline)")), /*#__PURE__*/React.createElement(StatusBadge, {
    tone: done ? "confirmed" : "info"
  }, done ? "Report ready" : `Stage ${Math.min(active + 1, STAGES.length)} of ${STAGES.length}`)), /*#__PURE__*/React.createElement(Card, {
    padding: "md",
    tone: "sunken"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 18,
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: "Marina Alvarez",
    size: 36
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      lineHeight: 1.25
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--text-sm)",
      fontWeight: 600
    }
  }, "Marina Alvarez"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--text-xs)",
      color: "var(--text-muted)"
    }
  }, "Candidate"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 16,
      flexWrap: "wrap"
    }
  }, [["Resume", "file-text"], ["LinkedIn", "linkedin"], ["GitHub · 3 repos", "github"]].map(([l, ic]) => /*#__PURE__*/React.createElement("span", {
    key: l,
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      fontSize: "var(--text-xs)",
      color: "var(--text-secondary)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: ic,
    size: 14,
    color: "var(--text-muted)"
  }), " ", l))))), /*#__PURE__*/React.createElement(Card, {
    padding: "lg"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 16,
      fontFamily: "var(--font-mono)",
      fontSize: 10,
      letterSpacing: "0.06em",
      textTransform: "uppercase",
      color: "var(--text-muted)"
    }
  }, "Pipeline"), STAGES.map((s, i) => /*#__PURE__*/React.createElement(StageItem, {
    key: s.title,
    state: stateFor(i),
    title: s.title,
    detail: i <= active ? s.detail : null,
    duration: i < active ? s.dur : null,
    last: i === STAGES.length - 1
  }))), /*#__PURE__*/React.createElement(Banner, {
    tone: "neutral",
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "info",
      size: 16
    })
  }, "The system organizes evidence and questions. It does not make a hiring decision."), done && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "flex-end"
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "accent",
    size: "lg",
    onClick: onComplete,
    trailingIcon: /*#__PURE__*/React.createElement(Icon, {
      name: "arrow-right",
      size: 17
    })
  }, "View report")));
}
window.AnalysisProgressScreen = AnalysisProgressScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/analyzer/AnalysisProgressScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/analyzer/AppShell.jsx
try { (() => {
// AppShell — header + optional wizard stepper. Wraps every analyzer screen.
const STEPS = [{
  key: "job",
  label: "Role baseline"
}, {
  key: "candidate",
  label: "Candidate evidence"
}, {
  key: "progress",
  label: "Analysis"
}, {
  key: "report",
  label: "Report"
}];
function Stepper({
  current
}) {
  const idx = STEPS.findIndex(s => s.key === current);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 0,
      flexWrap: "wrap"
    }
  }, STEPS.map((s, i) => {
    const state = i < idx ? "done" : i === idx ? "active" : "todo";
    return /*#__PURE__*/React.createElement(React.Fragment, {
      key: s.key
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 22,
        height: 22,
        borderRadius: "50%",
        flex: "none",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--font-mono)",
        fontSize: 11,
        fontWeight: 600,
        background: state === "done" ? "var(--status-confirmed-solid)" : state === "active" ? "var(--surface-inverse)" : "var(--surface-card)",
        color: state === "todo" ? "var(--text-muted)" : "var(--text-inverse)",
        border: state === "todo" ? "1px solid var(--border-default)" : "1px solid transparent"
      }
    }, state === "done" ? /*#__PURE__*/React.createElement(Icon, {
      name: "check",
      size: 13
    }) : i + 1), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--text-sm)",
        fontWeight: state === "active" ? 600 : 500,
        color: state === "active" ? "var(--text-primary)" : "var(--text-muted)",
        whiteSpace: "nowrap"
      }
    }, s.label)), i < STEPS.length - 1 && /*#__PURE__*/React.createElement("span", {
      style: {
        width: 28,
        height: 1,
        background: "var(--border-default)",
        margin: "0 12px",
        flex: "none"
      }
    }));
  }));
}
function AppShell({
  current,
  showStepper = true,
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      background: "var(--bg-app)"
    }
  }, /*#__PURE__*/React.createElement("header", {
    style: {
      height: "var(--header-height)",
      flex: "none",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 24px",
      background: "var(--surface-card)",
      borderBottom: "1px solid var(--border-subtle)",
      position: "sticky",
      top: 0,
      zIndex: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/logo-mark.svg",
    width: "26",
    height: "26",
    alt: ""
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      lineHeight: 1.1
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-sm)",
      fontWeight: 600,
      color: "var(--text-primary)"
    }
  }, "Technical Maturity Analyzer"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: "var(--text-2xs)",
      letterSpacing: "0.12em",
      color: "var(--text-muted)"
    }
  }, "EVIDENCE-FIRST SCREENING PREP"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      fontSize: "var(--text-xs)",
      color: "var(--text-muted)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "circle-help",
    size: 15
  }), " Methodology"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      paddingLeft: 14,
      borderLeft: "1px solid var(--border-subtle)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-xs)",
      color: "var(--text-secondary)"
    }
  }, "Dana Okafor"), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 28,
      height: 28,
      borderRadius: "var(--radius-md)",
      background: "var(--surface-sunken)",
      border: "1px solid var(--border-subtle)",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "var(--font-mono)",
      fontSize: 11,
      fontWeight: 600,
      color: "var(--text-secondary)"
    }
  }, "DO")))), showStepper && /*#__PURE__*/React.createElement("div", {
    style: {
      flex: "none",
      padding: "14px 24px",
      background: "var(--surface-card)",
      borderBottom: "1px solid var(--border-subtle)",
      display: "flex",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement(Stepper, {
    current: current
  })), /*#__PURE__*/React.createElement("main", {
    style: {
      flex: 1,
      padding: "32px 24px 64px"
    }
  }, children));
}
window.AppShell = AppShell;
window.Stepper = Stepper;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/analyzer/AppShell.jsx", error: String((e && e.message) || e) }); }

// ui_kits/analyzer/CandidateEvidenceScreen.jsx
try { (() => {
// Screen 2 — Candidate Evidence. Recruiter provides evidence sources.
function CandidateEvidenceScreen({
  onBack,
  onStart
}) {
  const {
    SourceCard,
    Textarea,
    Input,
    Field,
    Button,
    Banner,
    Card
  } = window.TechnicalMaturityAnalyzerDesignSystem_3be3ec;
  const [resume, setResume] = React.useState({
    filled: true,
    file: "marina-alvarez-resume.pdf · 184 KB",
    text: ""
  });
  const [linkedin, setLinkedin] = React.useState({
    filled: false,
    text: ""
  });
  const [github, setGithub] = React.useState("github.com/marina-dev");
  const [portfolio, setPortfolio] = React.useState("");
  const [notes, setNotes] = React.useState("");
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 760,
      margin: "0 auto",
      display: "flex",
      flexDirection: "column",
      gap: 24
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      fontSize: "var(--text-2xl)",
      fontWeight: 600,
      letterSpacing: "-0.01em"
    }
  }, "Add candidate evidence"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "6px 0 0",
      fontSize: "var(--text-md)",
      color: "var(--text-secondary)"
    }
  }, "Provide the sources the analysis should read. More sources mean fewer uncertainties \u2014 but missing evidence is treated as a question, never a verdict.")), /*#__PURE__*/React.createElement(Banner, {
    tone: "info",
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "shield",
      size: 17
    }),
    title: "Privacy"
  }, "Files are processed for this analysis only. Reports are stored in memory for the current session and may be lost on restart. Do not upload sensitive data you do not want processed in this demo."), /*#__PURE__*/React.createElement(SourceCard, {
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "file-text",
      size: 18
    }),
    title: "Resume",
    description: "PDF or pasted text. Used to extract technical claims.",
    required: true,
    filled: resume.filled,
    meta: resume.filled ? resume.file : null,
    action: resume.filled ? /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      variant: "ghost",
      onClick: () => setResume({
        filled: false,
        file: "",
        text: ""
      })
    }, "Replace") : /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      variant: "secondary",
      leadingIcon: /*#__PURE__*/React.createElement(Icon, {
        name: "upload",
        size: 15
      }),
      onClick: () => setResume({
        filled: true,
        file: "marina-alvarez-resume.pdf · 184 KB",
        text: ""
      })
    }, "Upload PDF")
  }, !resume.filled && /*#__PURE__*/React.createElement(Field, {
    htmlFor: "resumeTxt"
  }, /*#__PURE__*/React.createElement(Textarea, {
    id: "resumeTxt",
    rows: 4,
    placeholder: "\u2026or paste the resume text here",
    value: resume.text,
    onChange: e => setResume({
      ...resume,
      text: e.target.value
    })
  }))), /*#__PURE__*/React.createElement(SourceCard, {
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "linkedin",
      size: 18
    }),
    title: "LinkedIn export",
    description: "Upload a profile PDF or paste exported text. No login, cookies, or private access \u2014 this reads only what you provide.",
    filled: linkedin.filled,
    action: /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      variant: "secondary",
      leadingIcon: /*#__PURE__*/React.createElement(Icon, {
        name: "upload",
        size: 15
      }),
      onClick: () => setLinkedin({
        ...linkedin,
        filled: true
      })
    }, "Upload PDF")
  }, /*#__PURE__*/React.createElement(Field, {
    htmlFor: "liTxt"
  }, /*#__PURE__*/React.createElement(Textarea, {
    id: "liTxt",
    rows: 3,
    placeholder: "Paste exported LinkedIn text (Experience, Skills, Education)\u2026",
    value: linkedin.text,
    onChange: e => setLinkedin({
      filled: e.target.value.length > 0,
      text: e.target.value
    })
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(SourceCard, {
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "github",
      size: 18
    }),
    title: "GitHub",
    description: "Public, non-empty repositories only.",
    filled: github.length > 0
  }, /*#__PURE__*/React.createElement(Field, {
    htmlFor: "gh"
  }, /*#__PURE__*/React.createElement(Input, {
    id: "gh",
    leading: /*#__PURE__*/React.createElement(Icon, {
      name: "link",
      size: 15
    }),
    placeholder: "github.com/username",
    value: github,
    onChange: e => setGithub(e.target.value)
  }))), /*#__PURE__*/React.createElement(SourceCard, {
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "globe",
      size: 18
    }),
    title: "Portfolio",
    description: "Project pages and case studies.",
    filled: portfolio.length > 0
  }, /*#__PURE__*/React.createElement(Field, {
    htmlFor: "pf"
  }, /*#__PURE__*/React.createElement(Input, {
    id: "pf",
    leading: /*#__PURE__*/React.createElement(Icon, {
      name: "link",
      size: 15
    }),
    placeholder: "https://portfolio.dev",
    value: portfolio,
    onChange: e => setPortfolio(e.target.value)
  })))), /*#__PURE__*/React.createElement(Card, {
    padding: "lg"
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Recruiter notes",
    htmlFor: "cnotes",
    optional: true,
    hint: "Anything the analyst should weigh \u2014 referrals, prior conversations, specific concerns."
  }, /*#__PURE__*/React.createElement(Textarea, {
    id: "cnotes",
    rows: 3,
    value: notes,
    onChange: e => setNotes(e.target.value),
    placeholder: "e.g. Referred internally. Strong portfolio but unsure about backend depth."
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    size: "lg",
    onClick: onBack,
    leadingIcon: /*#__PURE__*/React.createElement(Icon, {
      name: "arrow-left",
      size: 17
    })
  }, "Back to role"), /*#__PURE__*/React.createElement(Button, {
    variant: "accent",
    size: "lg",
    onClick: onStart,
    trailingIcon: /*#__PURE__*/React.createElement(Icon, {
      name: "scan-line",
      size: 17
    })
  }, "Start analysis")));
}
window.CandidateEvidenceScreen = CandidateEvidenceScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/analyzer/CandidateEvidenceScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/analyzer/JobInputScreen.jsx
try { (() => {
// Screen 1 — Job Input. Recruiter defines the technical role baseline.
function JobInputScreen({
  onContinue
}) {
  const {
    Field,
    Textarea,
    Input,
    SegmentedControl,
    Tag,
    Button,
    Card
  } = window.TechnicalMaturityAnalyzerDesignSystem_3be3ec;
  const [jd, setJd] = React.useState("We're hiring a full-stack engineer to own customer-facing features end to end. You'll work across a typed React frontend and Go services on AWS, collaborate on API design, and care about testing and deployment quality.");
  const [level, setLevel] = React.useState("Mid-level");
  const [years, setYears] = React.useState("");
  const [stacks, setStacks] = React.useState([{
    name: "React",
    primary: true
  }, {
    name: "TypeScript",
    primary: true
  }, {
    name: "Go",
    primary: true
  }, {
    name: "PostgreSQL",
    primary: false
  }, {
    name: "AWS",
    primary: false
  }, {
    name: "Docker",
    primary: false
  }]);
  const [draft, setDraft] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const primaryCount = stacks.filter(s => s.primary).length;
  const addStack = () => {
    const v = draft.trim();
    if (!v || stacks.some(s => s.name.toLowerCase() === v.toLowerCase())) {
      setDraft("");
      return;
    }
    setStacks([...stacks, {
      name: v,
      primary: false
    }]);
    setDraft("");
  };
  const togglePrimary = name => setStacks(prev => prev.map(s => {
    if (s.name !== name) return s;
    if (!s.primary && primaryCount >= 3) return s;
    return {
      ...s,
      primary: !s.primary
    };
  }));
  const remove = name => setStacks(prev => prev.filter(s => s.name !== name));
  const SectionTitle = ({
    n,
    children,
    hint
  }) => /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 11,
      color: "var(--text-muted)"
    }
  }, n), /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontSize: "var(--text-lg)",
      fontWeight: 600,
      color: "var(--text-primary)"
    }
  }, children)), hint && /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "4px 0 0 26px",
      fontSize: "var(--text-xs)",
      color: "var(--text-muted)"
    }
  }, hint));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 760,
      margin: "0 auto",
      display: "flex",
      flexDirection: "column",
      gap: 24
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      fontSize: "var(--text-2xl)",
      fontWeight: 600,
      letterSpacing: "-0.01em"
    }
  }, "Define the role baseline"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "6px 0 0",
      fontSize: "var(--text-md)",
      color: "var(--text-secondary)"
    }
  }, "Evidence-first screening prep for technical roles. The baseline guides how candidate evidence is weighed \u2014 it is not a scoring rubric.")), /*#__PURE__*/React.createElement(Card, {
    padding: "lg"
  }, /*#__PURE__*/React.createElement(SectionTitle, {
    n: "01"
  }, "Job description"), /*#__PURE__*/React.createElement(Field, {
    htmlFor: "jd",
    hint: "Paste the full description. Responsibilities and required technologies improve the role profile."
  }, /*#__PURE__*/React.createElement(Textarea, {
    id: "jd",
    rows: 7,
    value: jd,
    onChange: e => setJd(e.target.value),
    showCount: true,
    maxLength: 6000
  }))), /*#__PURE__*/React.createElement(Card, {
    padding: "lg"
  }, /*#__PURE__*/React.createElement(SectionTitle, {
    n: "02"
  }, "Seniority & experience"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 24,
      flexWrap: "wrap",
      alignItems: "flex-end"
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Seniority baseline"
  }, /*#__PURE__*/React.createElement(SegmentedControl, {
    options: ["Intern", "Junior", "Mid-level", "Senior", "Staff"],
    value: level,
    onChange: setLevel
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Years of experience",
    htmlFor: "yr",
    optional: true,
    style: {
      width: 160
    }
  }, /*#__PURE__*/React.createElement(Input, {
    id: "yr",
    type: "number",
    min: "0",
    placeholder: "e.g. 5",
    value: years,
    onChange: e => setYears(e.target.value)
  })))), /*#__PURE__*/React.createElement(Card, {
    padding: "lg"
  }, /*#__PURE__*/React.createElement(SectionTitle, {
    n: "03",
    hint: "Mark up to 3 primary stacks. Primary stacks focus the evidence matrix and STAR questions on what matters most for this role."
  }, "Tech stack"), /*#__PURE__*/React.createElement(Field, {
    label: "Add a technology",
    htmlFor: "stack"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(Input, {
    id: "stack",
    placeholder: "Type a technology and press Enter",
    value: draft,
    onChange: e => setDraft(e.target.value),
    onKeyDown: e => {
      if (e.key === "Enter") {
        e.preventDefault();
        addStack();
      }
    }
  }), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    onClick: addStack
  }, "Add"))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16,
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 10,
      letterSpacing: "0.06em",
      textTransform: "uppercase",
      color: "var(--text-muted)"
    }
  }, "Selected stacks"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 10,
      color: primaryCount >= 3 ? "var(--status-validate-fg)" : "var(--text-muted)"
    }
  }, primaryCount, " / 3 primary")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      flexWrap: "wrap"
    }
  }, stacks.map(s => /*#__PURE__*/React.createElement(Tag, {
    key: s.name,
    primary: s.primary,
    removable: true,
    onRemove: () => remove(s.name),
    onClick: () => togglePrimary(s.name)
  }, s.name))), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "2px 0 0",
      fontSize: "var(--text-xs)",
      color: "var(--text-muted)"
    }
  }, "Click a chip to toggle it as primary. Primary stacks are shown with a dot."))), /*#__PURE__*/React.createElement(Card, {
    padding: "lg"
  }, /*#__PURE__*/React.createElement(SectionTitle, {
    n: "04"
  }, "Recruiter notes"), /*#__PURE__*/React.createElement(Field, {
    htmlFor: "notes",
    optional: true,
    hint: "Context the analysis should keep in mind \u2014 team, constraints, what you're unsure about."
  }, /*#__PURE__*/React.createElement(Textarea, {
    id: "notes",
    rows: 3,
    value: notes,
    onChange: e => setNotes(e.target.value),
    placeholder: "e.g. Replacing a senior who owned deployment. Backend ownership matters more than breadth."
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "flex-end",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "accent",
    size: "lg",
    onClick: onContinue,
    trailingIcon: /*#__PURE__*/React.createElement(Icon, {
      name: "arrow-right",
      size: 17
    })
  }, "Continue to candidate evidence")));
}
window.JobInputScreen = JobInputScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/analyzer/JobInputScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/analyzer/ReportScreen.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// Screen 4 — Report. Evidence-first technical maturity analysis. No score.
function ReportScreen({
  onRestart
}) {
  const {
    QualBadge,
    QuadrantCard,
    StarQuestion,
    Card,
    Button,
    StatusBadge,
    Avatar,
    Banner
  } = window.TechnicalMaturityAnalyzerDesignSystem_3be3ec;
  const [methodOpen, setMethodOpen] = React.useState(false);
  const SectionHead = ({
    icon,
    title,
    sub,
    right
  }) => /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "space-between",
      gap: 12,
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 17,
    color: "var(--text-secondary)"
  }), /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontSize: "var(--text-xl)",
      fontWeight: 600,
      letterSpacing: "-0.01em"
    }
  }, title)), sub && /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "4px 0 0 25px",
      fontSize: "var(--text-sm)",
      color: "var(--text-muted)"
    }
  }, sub)), right);
  const badges = [["Seniority Signal", "Mid plausible — validate backend ownership", "validate"], ["Stack Evidence", "Strong in React / TypeScript", "confirmed"], ["Project Depth", "Moderate, frontend-led", "uncertain"], ["Backend Evidence", "Limited in public repos", "gap"], ["Public Proof", "Mixed — GitHub yes, portfolio no", "uncertain"], ["Interview Priority", "High on backend & deployment", "validate"]];
  const quads = [{
    quadrant: "strong_with_evidence",
    title: "React and TypeScript project ownership",
    source: "GitHub repository shows a typed React/Vite application with components, API client structure and documentation.",
    rationale: "Original (non-fork) project with consistent commit history and a clear README.",
    interviewFocus: "Validate ownership, trade-offs and production depth."
  }, {
    quadrant: "strong_needs_validation",
    title: "AWS deployment experience",
    source: "Candidate mentions cloud deployment, but public repositories do not show infrastructure files or deployment docs.",
    rationale: "Claim is plausible for the role but evidence is indirect.",
    interviewFocus: "Ask for a concrete deployment story end to end."
  }, {
    quadrant: "weak_with_evidence",
    title: "Backend depth for full-stack role",
    source: "Public repositories are mostly frontend-focused and show limited API/server-side logic.",
    rationale: "Relevant gap against a full-stack baseline that expects service ownership.",
    interviewFocus: "Validate whether backend work exists in private or professional projects."
  }, {
    quadrant: "weak_needs_validation",
    title: "Testing practice",
    source: "Limited public test files were found. This does not prove a lack of testing experience.",
    rationale: "Weak public signal only; professional work may differ.",
    interviewFocus: "Ask how the candidate tests features in professional work."
  }];
  const stars = [{
    question: "Tell me about a specific project where you owned a feature from implementation to deployment. What was the situation, what were you responsible for, what technical decisions did you make, and what was the result?",
    followUps: ["What trade-offs did you consider?", "How did you validate the solution?", "What would you change if you rebuilt it today?"],
    reveals: "ownership depth, decision-making and production awareness"
  }, {
    question: "Describe a time you worked on the backend or API side of a system. What was the data flow, and how did you handle errors and edge cases?",
    followUps: ["How did you test it?", "What would you do differently at higher scale?"],
    reveals: "whether backend depth exists beyond the public repositories"
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1000,
      margin: "0 auto",
      display: "flex",
      flexDirection: "column",
      gap: 32
    }
  }, /*#__PURE__*/React.createElement(Card, {
    padding: "lg"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      gap: 20,
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: "Marina Alvarez",
    size: 48
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      fontSize: "var(--text-2xl)",
      fontWeight: 600,
      letterSpacing: "-0.01em"
    }
  }, "Marina Alvarez"), /*#__PURE__*/React.createElement(StatusBadge, {
    tone: "info",
    dot: false
  }, "Technical maturity report")), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "4px 0 0",
      fontSize: "var(--text-sm)",
      color: "var(--text-secondary)"
    }
  }, "Full-stack Engineer \xB7 Mid-level baseline \xB7 React, TypeScript, Go"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "2px 0 0",
      fontFamily: "var(--font-mono)",
      fontSize: "var(--text-2xs)",
      color: "var(--text-muted)"
    }
  }, "Sources: resume \xB7 linkedin \xB7 github (3 repos) \xB7 portfolio not provided"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-start",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    leadingIcon: /*#__PURE__*/React.createElement(Icon, {
      name: "rotate-ccw",
      size: 15
    }),
    onClick: onRestart
  }, "New analysis"), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    leadingIcon: /*#__PURE__*/React.createElement(Icon, {
      name: "download",
      size: 15
    })
  }, "Export Markdown")))), /*#__PURE__*/React.createElement("section", null, /*#__PURE__*/React.createElement(SectionHead, {
    icon: "file-text",
    title: "Executive summary"
  }), /*#__PURE__*/React.createElement(Card, {
    padding: "lg"
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontFamily: "var(--font-serif)",
      fontSize: "var(--text-lg)",
      lineHeight: "var(--leading-relaxed)",
      color: "var(--text-primary)"
    }
  }, "Public evidence suggests a capable frontend engineer with clear ownership of typed React work. Against a mid-level full-stack baseline, the strongest uncertainty is backend and deployment depth: claims are plausible but not yet publicly evidenced. None of this indicates a gap in ability \u2014 it points to where the technical screen should focus. Treat the items below as an interview map, not a verdict."))), /*#__PURE__*/React.createElement("section", null, /*#__PURE__*/React.createElement(SectionHead, {
    icon: "tags",
    title: "Qualitative signals",
    sub: "Directional, never numeric. Each is a starting point for the conversation."
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: 12
    }
  }, badges.map(([l, v, t]) => /*#__PURE__*/React.createElement(QualBadge, {
    key: l,
    label: l,
    value: v,
    tone: t
  })))), /*#__PURE__*/React.createElement("section", null, /*#__PURE__*/React.createElement(SectionHead, {
    icon: "layout-grid",
    title: "Evidence matrix",
    sub: "Findings placed by strength of signal and how directly evidence supports them."
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 14
    }
  }, quads.map(q => /*#__PURE__*/React.createElement(QuadrantCard, _extends({
    key: q.title
  }, q))))), /*#__PURE__*/React.createElement("section", null, /*#__PURE__*/React.createElement(SectionHead, {
    icon: "message-square-quote",
    title: "STAR interview questions",
    sub: "Generated from the matrix gaps. Copy individually into your screen notes."
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 12
    }
  }, stars.map((s, i) => /*#__PURE__*/React.createElement(StarQuestion, _extends({
    key: i,
    index: i + 1
  }, s))))), /*#__PURE__*/React.createElement("section", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(Card, {
    padding: "lg"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "user-round",
    size: 16,
    color: "var(--text-secondary)"
  }), /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontSize: "var(--text-md)",
      fontWeight: 600
    }
  }, "Recruiter summary")), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: "var(--text-sm)",
      lineHeight: "var(--leading-relaxed)",
      color: "var(--text-secondary)"
    }
  }, "Strong, evidenced frontend profile worth moving to a technical screen. Lead with backend and deployment stories to validate full-stack readiness. Portfolio was not provided \u2014 consider requesting it before the interview.")), /*#__PURE__*/React.createElement(Card, {
    padding: "lg"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "users-round",
    size: 16,
    color: "var(--text-secondary)"
  }), /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontSize: "var(--text-md)",
      fontWeight: 600
    }
  }, "Hiring manager summary")), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: "var(--text-sm)",
      lineHeight: "var(--leading-relaxed)",
      color: "var(--text-secondary)"
    }
  }, "Confident React/TypeScript ownership in public work. Open questions: API/server depth, testing practice, and a concrete AWS deployment. The evidence matrix and STAR set are built to resolve these in one screening session.")))), /*#__PURE__*/React.createElement("section", null, /*#__PURE__*/React.createElement(Card, {
    padding: "none"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setMethodOpen(o => !o),
    style: {
      width: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
      padding: "16px 20px",
      background: "transparent",
      border: "none",
      cursor: "pointer",
      textAlign: "left"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "scale",
    size: 16,
    color: "var(--text-secondary)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-md)",
      fontWeight: 600,
      color: "var(--text-primary)"
    }
  }, "Methodology & limitations")), /*#__PURE__*/React.createElement(Icon, {
    name: methodOpen ? "chevron-up" : "chevron-down",
    size: 18,
    color: "var(--text-muted)"
  })), methodOpen && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "0 20px 20px",
      display: "flex",
      flexDirection: "column",
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(Banner, {
    tone: "neutral",
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "info",
      size: 16
    })
  }, "This report organizes evidence and questions. It does not produce a match score, a ranking, or a hire/reject decision."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 20
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 10,
      letterSpacing: "0.06em",
      textTransform: "uppercase",
      color: "var(--text-muted)",
      marginBottom: 8
    }
  }, "How evidence was read"), /*#__PURE__*/React.createElement("ul", {
    style: {
      margin: 0,
      paddingLeft: 18,
      fontSize: "var(--text-sm)",
      color: "var(--text-secondary)",
      lineHeight: "var(--leading-relaxed)",
      display: "flex",
      flexDirection: "column",
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("li", null, "GitHub repositories analyzed statically \u2014 no code was executed."), /*#__PURE__*/React.createElement("li", null, "LinkedIn treated as public self-report, not verified fact."), /*#__PURE__*/React.createElement("li", null, "Each finding cites its source and stays separate from inference."))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 10,
      letterSpacing: "0.06em",
      textTransform: "uppercase",
      color: "var(--text-muted)",
      marginBottom: 8
    }
  }, "Limitations"), /*#__PURE__*/React.createElement("ul", {
    style: {
      margin: 0,
      paddingLeft: 18,
      fontSize: "var(--text-sm)",
      color: "var(--text-secondary)",
      lineHeight: "var(--leading-relaxed)",
      display: "flex",
      flexDirection: "column",
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("li", null, "Absence of public evidence is not evidence of absence."), /*#__PURE__*/React.createElement("li", null, "Private and professional work is not visible here."), /*#__PURE__*/React.createElement("li", null, "Portfolio was not provided, leaving project depth partly open."))))))));
}
window.ReportScreen = ReportScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/analyzer/ReportScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/analyzer/icons.jsx
try { (() => {
// Icon — renders a real Lucide icon (loaded via CDN umd as window.lucide).
// Avoids hand-rolled SVG; uses the Lucide outline set (1.75 stroke).
function Icon({
  name,
  size = 18,
  color,
  strokeWidth = 1.75,
  style
}) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const host = ref.current;
    if (!host || !window.lucide) return;
    host.innerHTML = "";
    const i = document.createElement("i");
    i.setAttribute("data-lucide", name);
    host.appendChild(i);
    try {
      window.lucide.createIcons({
        attrs: {
          "stroke-width": strokeWidth
        }
      });
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
  return /*#__PURE__*/React.createElement("span", {
    ref: ref,
    "aria-hidden": "true",
    style: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      color: color || "currentColor",
      lineHeight: 0,
      ...style
    }
  });
}
window.Icon = Icon;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/analyzer/icons.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Avatar = __ds_scope.Avatar;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.Banner = __ds_scope.Banner;

__ds_ns.StageItem = __ds_scope.StageItem;

__ds_ns.StatusBadge = __ds_scope.StatusBadge;

__ds_ns.Field = __ds_scope.Field;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.SegmentedControl = __ds_scope.SegmentedControl;

__ds_ns.Tag = __ds_scope.Tag;

__ds_ns.Textarea = __ds_scope.Textarea;

__ds_ns.QuadrantCard = __ds_scope.QuadrantCard;

__ds_ns.QualBadge = __ds_scope.QualBadge;

__ds_ns.SourceCard = __ds_scope.SourceCard;

__ds_ns.StarQuestion = __ds_scope.StarQuestion;

})();
