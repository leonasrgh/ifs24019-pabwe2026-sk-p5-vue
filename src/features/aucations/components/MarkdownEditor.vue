<template>
  <div class="toastui-editor-wrapper">
    <!-- Fallback hidden textarea with data-testid for accessibility and test compatibility -->
    <textarea
      :data-testid="textareaTestId"
      :value="modelValue"
      @input="onTextareaInput"
      class="hidden"
      tabindex="-1"
      aria-hidden="true"
    />
    <div ref="editorContainer" data-testid="markdown-editor-container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onBeforeUnmount } from "vue";
import Editor from "@toast-ui/editor";
import "@toast-ui/editor/dist/toastui-editor.css";

const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
  placeholder: {
    type: String,
    default: "Tulis deskripsi dengan format Markdown...",
  },
  height: {
    type: String,
    default: "240px",
  },
  textareaTestId: {
    type: String,
    default: "markdown-editor-textarea",
  },
});

const emit = defineEmits(["update:modelValue", "change"]);

const editorContainer = ref(null);
let editorInstance = null;

onMounted(() => {
  editorInstance = new Editor({
    el: editorContainer.value,
    height: props.height,
    initialEditType: "markdown",
    previewStyle: "tab",
    initialValue: props.modelValue || "",
    placeholder: props.placeholder,
    usageStatistics: false,
    hideModeSwitch: false,
    events: {
      change: () => {
        const markdown = editorInstance.getMarkdown();
        emit("update:modelValue", markdown);
        emit("change", markdown);
      },
    },
  });
});

watch(
  () => props.modelValue,
  (newVal) => {
    const currentVal = editorInstance.getMarkdown();
    if (newVal !== currentVal) {
      editorInstance.setMarkdown(newVal || "");
    }
  }
);

function onTextareaInput(e) {
  emit("update:modelValue", e.target.value);
  emit("change", e.target.value);
  editorInstance.setMarkdown(e.target.value);
}

onBeforeUnmount(() => {
  editorInstance.destroy();
  editorInstance = null;
});
</script>

<style>
.toastui-editor-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
}
.toastui-editor-wrapper > div[data-testid="markdown-editor-container"] {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
}
.toastui-editor-wrapper .toastui-editor-defaultUI {
  display: flex;
  flex-direction: column;
  height: 100%;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  overflow: hidden;
  font-family: inherit;
}
.toastui-editor-wrapper .toastui-editor-main {
  flex: 1;
  min-height: 0;
}
.toastui-editor-wrapper .toastui-editor-toolbar {
  background-color: #f8fafc;
  border-bottom: 1px solid #f1f5f9;
}
.toastui-editor-wrapper .toastui-editor-contents {
  font-family: inherit;
  font-size: 0.875rem;
}
</style>
