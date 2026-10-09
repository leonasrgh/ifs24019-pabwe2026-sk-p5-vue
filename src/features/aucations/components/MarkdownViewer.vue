<template>
  <div ref="viewerContainer" class="toastui-editor-viewer-wrapper" data-testid="markdown-viewer"></div>
</template>

<script setup>
import { ref, onMounted, watch, onBeforeUnmount } from "vue";
import Viewer from "@toast-ui/editor/dist/toastui-editor-viewer";
import "@toast-ui/editor/dist/toastui-editor-viewer.css";

const props = defineProps({
  content: {
    type: String,
    default: "",
  },
});

const viewerContainer = ref(null);
let viewerInstance = null;

onMounted(() => {
  viewerInstance = new Viewer({
    el: viewerContainer.value,
    initialValue: props.content || "",
  });
});

watch(
  () => props.content,
  (newContent) => {
    viewerInstance.setMarkdown(newContent || "");
  }
);

onBeforeUnmount(() => {
  viewerInstance.destroy();
  viewerInstance = null;
});
</script>

<style>
.toastui-editor-viewer-wrapper .toastui-editor-contents {
  font-family: inherit;
  font-size: 0.95rem;
  color: #475569;
}
</style>
