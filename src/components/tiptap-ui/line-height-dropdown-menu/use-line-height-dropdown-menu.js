"use client";
import { useEffect, useState } from "react";

// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor";

// --- Icons ---
import { LineHeightIcon } from "@/components/tiptap-icons/line-height-icon";

// --- Tiptap UI ---
import {
  lineHeightIcons,
  isLineHeightActive,
  canToggle,
  shouldShowButton,
} from "@/components/tiptap-ui/line-height-button";

/**
 * Gets the currently active line-height level from the available levels
 */
export function getActiveLineHeightLevel(editor, levels = [1.5, 2.0, 4.0]) {
  if (!editor || !editor.isEditable) return undefined;
  return levels.find((level) => isLineHeightActive(editor, level));
}

/**
 * Custom hook that provides line-height dropdown menu functionality for Tiptap editor
 *
 * @example
 * ```tsx
 * // Simple usage
 * function MyLineHeightDropdown() {
 *   const {
 *     isVisible,
 *     activeLevel,
 *     isAnyLineHeightActive,
 *     canToggle,
 *     levels,
 *   } = useLineHeightDropdownMenu()
 *
 *   if (!isVisible) return null
 *
 *   return (
 *     <DropdownMenu>
 *       // dropdown content
 *     </DropdownMenu>
 *   )
 * }
 *
 * // Advanced usage with configuration
 * function MyAdvancedLineHeightDropdown() {
 *   const {
 *     isVisible,
 *     activeLevel,
 *   } = useLineHeightDropdownMenu({
 *     editor: myEditor,
 *     levels: [1, 2, 3],
 *     hideWhenUnavailable: true,
 *   })
 *
 *   // component implementation
 * }
 * ```
 */
export function useLineHeightDropdownMenu(config) {
  const {
    editor: providedEditor,
    levels = [1.5, 2.0, 4.0],
    hideWhenUnavailable = false,
  } = config || {};

  const { editor } = useTiptapEditor(providedEditor);
  const [isVisible, setIsVisible] = useState(true);

  const activeLevel = getActiveLineHeightLevel(editor, levels);
  const isActive = isLineHeightActive(editor);
  const canToggleState = canToggle(editor);

  useEffect(() => {
    if (!editor) return;

    const handleSelectionUpdate = () => {
      setIsVisible(
        shouldShowButton({ editor, hideWhenUnavailable, level: levels })
      );
    };

    handleSelectionUpdate();

    editor.on("selectionUpdate", handleSelectionUpdate);

    return () => {
      editor.off("selectionUpdate", handleSelectionUpdate);
    };
  }, [editor, hideWhenUnavailable, levels]);

  return {
    isVisible,
    activeLevel,
    isActive,
    canToggle: canToggleState,
    levels,
    label: "Line Height",
    Icon: activeLevel ? lineHeightIcons[activeLevel] : LineHeightIcon,
  };
}
