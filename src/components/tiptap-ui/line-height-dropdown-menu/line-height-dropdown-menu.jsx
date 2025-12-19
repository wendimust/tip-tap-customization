import { forwardRef, useCallback, useState } from "react";

// --- Icons ---
import { ChevronDownIcon } from "@/components/tiptap-icons/chevron-down-icon";

// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor";

// --- Tiptap UI ---
import { LineHeightButton } from "@/components/tiptap-ui/line-height-button";
import { useLineHeightDropdownMenu } from "@/components/tiptap-ui/line-height-dropdown-menu";

import { Button, ButtonGroup } from "@/components/tiptap-ui-primitive/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/tiptap-ui-primitive/dropdown-menu";
import { Card, CardBody } from "@/components/tiptap-ui-primitive/card";

// --- Tiptap UI (helpers) ---
import {
  DEFAULT_LINE_HEIGHTS,
  normalizeLineHeightOption,
} from "@/components/tiptap-ui/line-height-button";

/**
 * Dropdown menu component for selecting line height levels in a Tiptap editor.
 *
 * For custom dropdown implementations, use the `useLineHeightDropdownMenu` hook instead.
 */
export const LineHeightDropdownMenu = forwardRef(
  (
    {
      editor: providedEditor,
      lineHeights = DEFAULT_LINE_HEIGHTS,
      hideWhenUnavailable = false,
      portal = false,
      onOpenChange,
      ...buttonProps
    },
    ref
  ) => {
    const { editor } = useTiptapEditor(providedEditor);
    const [isOpen, setIsOpen] = useState(false);
    const { isVisible, isActive, canToggle, Icon } = useLineHeightDropdownMenu({
      editor,
      lineHeights,
      hideWhenUnavailable,
    });

    const handleOpenChange = useCallback(
      (open) => {
        if (!editor || !canToggle) return;
        setIsOpen(open);
        onOpenChange?.(open);
      },
      [canToggle, editor, onOpenChange]
    );

    if (!isVisible) {
      return null;
    }

    const normalizedOptions = (lineHeights ?? DEFAULT_LINE_HEIGHTS)
      .map(normalizeLineHeightOption)
      .filter((option) => option.value != null);

    return (
      <DropdownMenu modal open={isOpen} onOpenChange={handleOpenChange}>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            data-style="ghost"
            data-active-state={isActive ? "on" : "off"}
            role="button"
            tabIndex={-1}
            disabled={!canToggle}
            data-disabled={!canToggle}
            aria-label="Change text's line height"
            aria-pressed={isActive}
            tooltip="Line Height"
            {...buttonProps}
            ref={ref}
          >
            <Icon className="tiptap-button-icon" />
            <ChevronDownIcon className="tiptap-button-dropdown-small" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" portal={portal}>
          <Card>
            <CardBody>
              <ButtonGroup>
                {normalizedOptions.map((option) => (
                  <DropdownMenuItem
                    key={`line-height-${option.value}`}
                    asChild
                  >
                    <LineHeightButton
                      editor={editor}
                      lineHeight={option.value}
                      text={option.label}
                      showTooltip={false}
                    />
                  </DropdownMenuItem>
                ))}
              </ButtonGroup>
            </CardBody>
          </Card>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
);

LineHeightDropdownMenu.displayName = "LineHeightDropdownMenu";

export default LineHeightDropdownMenu;
