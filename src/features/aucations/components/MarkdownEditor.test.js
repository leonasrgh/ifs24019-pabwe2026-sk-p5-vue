import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import MarkdownEditor from "./MarkdownEditor.vue";

let mockEvents = {};
const mockGetMarkdown = vi.fn(() => "mock editor text");
const mockSetMarkdown = vi.fn();
const mockDestroy = vi.fn();

vi.mock("@toast-ui/editor", () => {
  return {
    default: vi.fn().mockImplementation(function (options) {
      mockEvents = options.events || {};
      this.getMarkdown = mockGetMarkdown;
      this.setMarkdown = mockSetMarkdown;
      this.destroy = mockDestroy;
    }),
  };
});

describe("MarkdownEditor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEvents = {};
  });

  it("should initialize Editor with props and handle change event", async () => {
    const wrapper = mount(MarkdownEditor, {
      props: {
        modelValue: "initial text",
        placeholder: "Tulis...",
        height: "300px",
        textareaTestId: "custom-editor-textarea",
      },
    });

    expect(wrapper.find('[data-testid="custom-editor-textarea"]').exists()).toBe(true);

    // Trigger editor event change
    if (mockEvents.change) {
      mockEvents.change();
    }
    expect(wrapper.emitted("update:modelValue")).toBeTruthy();
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["mock editor text"]);
    expect(wrapper.emitted("change")?.[0]).toEqual(["mock editor text"]);

    // Update prop modelValue to same value as currentVal
    await wrapper.setProps({ modelValue: "mock editor text" });

    // Update prop modelValue to different value
    await wrapper.setProps({ modelValue: "updated prop" });
    expect(mockSetMarkdown).toHaveBeenCalledWith("updated prop");

    // Update prop modelValue to empty/falsy
    await wrapper.setProps({ modelValue: "" });
    expect(mockSetMarkdown).toHaveBeenCalledWith("");

    // Unmount
    wrapper.unmount();
    expect(mockDestroy).toHaveBeenCalled();
  });

  it("should handle onTextareaInput fallback", async () => {
    const wrapper = mount(MarkdownEditor, {
      props: {
        modelValue: "",
      },
    });

    const textarea = wrapper.find("textarea");
    await textarea.setValue("manual input");

    expect(wrapper.emitted("update:modelValue")).toBeTruthy();
    expect(wrapper.emitted("change")).toBeTruthy();
    expect(mockSetMarkdown).toHaveBeenCalledWith("manual input");
  });
});
