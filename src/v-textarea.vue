<template>
	<textarea 
	  ref="textarea"
	  :value="modelValue"
	  @input="updateValue"
	></textarea>
  </template>
  <script>
  import { ref, watch, onMounted, nextTick } from 'vue';
  
  export default {
	name: 'VTextarea',
	props: {
	  modelValue: String, // `v-model` en Vue 3 usa `modelValue`
	},
	setup(props, { emit }) {
	  const textarea = ref(null); // Referencia al <textarea>
  
	  // Emitir cambio de valor
	  const updateValue = (event) => {
		emit('update:modelValue', event.target.value);
		delayedResize();
	  };
  
	  // Ajustar la altura del textarea automáticamente
	  const resize = () => {
		if (!textarea.value) return;
		textarea.value.style.height = 'auto';
		if(textarea.value.value)
		textarea.value.style.height = `${textarea.value.scrollHeight}px`;
	  };
  
	  const delayedResize = () => {
		nextTick(resize);
	  };
  
	  // Redimensionar cuando cambie el `modelValue`
	  watch(() => props.modelValue, delayedResize, { immediate: true });
  
	  onMounted(() => {
		const text = textarea.value;
		if (!text) return;
  
		text.addEventListener('change', resize);
		text.addEventListener('cut', delayedResize);
		text.addEventListener('paste', delayedResize);
		text.addEventListener('drop', delayedResize);
		text.addEventListener('keydown', delayedResize);
  
		delayedResize(); // Ajuste inicial
	  });
  
	  return {
		textarea,
		updateValue,
	  };
	}
  };
  </script>
  <style>
  textarea {
	  box-sizing: border-box;
	  resize: none;
  }
  </style>