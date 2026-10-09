import { ref } from "vue";

export default function useInput(defaultValue = "") {
  const value = ref(defaultValue);

  function handleValueChange(event) {
    value.value = event?.target?.value !== undefined ? event.target.value : event;
  }

  return [value, handleValueChange, (val) => { value.value = val; }];
}
