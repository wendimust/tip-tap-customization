import { forwardRef, useCallback } from "react";

// --- Lib ---
import { parseShortcutKeys } from "@/lib/tiptap-utils";

import {
  LINE_HEIGHT_SHORTCUT_KEYS,
  useLineHeight,
} from "@/components/tiptap-ui/line-height-button";

import { Button } from "@/components/tiptap-ui-primitive/button";
import { Badge } from "@/components/tiptap-ui-primitive/badge";
import { useTiptapEditor } from "@/hooks/use-tiptap-editor";

export function LineHeightShortcutBadge({
  level,
  shortcutKeys = LINE_HEIGHT_SHORTCUT_KEYS[level],
}) {
  return <Badge>{parseShortcutKeys({ shortcutKeys })}</Badge>;
}

/**
 * Button component for toggling line-height in a Tiptap editor.
 *
 * For custom button implementations, use the `useLineHeight` hook instead.
 */
export const LineHeightButton = forwardRef(
  (
    {
      editor: providedEditor,
      level,
      text,
      hideWhenUnavailable = false,
      onToggled,
      showShortcut = false,
      onClick,
      children,
      ...buttonProps
    },
    ref
  ) => {
    const { editor } = useTiptapEditor(providedEditor);
    const {
      isVisible,
      canToggle,
      isActive,
      handleToggle,
      label,
      Icon,
      shortcutKeys,
    } = useLineHeight({
      editor,
      level,
      hideWhenUnavailable,
      onToggled,
    });

    const handleClick = useCallback(
      (event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        handleToggle();
      },
      [handleToggle, onClick]
    );

    if (!isVisible) {
      return null;
    }

    return (
      <Button
        type="button"
        data-style="ghost"
        data-active-state={isActive ? "on" : "off"}
        role="button"
        tabIndex={-1}
        disabled={!canToggle}
        data-disabled={!canToggle}
        aria-label={label}
        aria-pressed={isActive}
        tooltip={label}
        onClick={handleClick}
        {...buttonProps}
        ref={ref}
      >
        {children ?? (
          <>
            <Icon className="tiptap-button-icon" />
            {text && <span className="tiptap-button-text">{text}</span>}
            {showShortcut && (
              <LineHeightShortcutBadge
                level={level}
                shortcutKeys={shortcutKeys}
              />
            )}
          </>
        )}
      </Button>
    );
  }
);

LineHeightButton.displayName = "LineHeightButton";
