<template>
  <div
    class="v-uploader"
    :class="[
      onlyicon ? '' : 'v-button ui-widget ui-state-default ui-corner-all',
      { disabled }
    ]"
    :style="{ padding: onlyicon ? '0px' : '' }"
    @click="handleClick"
  >
    <label style="cursor:pointer">
      <input
        v-if="!click"
        type="file"
        :disabled="disabled"
        @change="handleFileUpload"
      />

      <i
        class="fa"
        :class="icon || 'fa-upload'"
        :data-icon="icon"
        :style="{ marginRight: (onlyicon || !value) ? '' : '10px' }"
      />

      {{ !onlyicon ? (value ?? 'Adjuntar Archivo') : '' }}

      <progress
        v-if="showProgress"
        max="100"
        :value="uploadPercentage"
        style="width: 100%"
      />
    </label>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'

const props = defineProps({
  value: String,
  onlyicon: Boolean,
  click: Function,
  icon: String,
  domain: String,
  action: String, 
  dst: String,
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:value', 'input'])

const uploadPercentage = ref(0)
const showProgress = ref(false)

function handleClick() {
  if (props.disabled) return

  if (props.click) {
    props.click()
  }
}

function handleFileUpload(event) {
  if (props.disabled) {
    event.target.value = ''
    return
  }

  const file = event.target.files?.[0]

  if (!file) return

  uploadPercentage.value = 0
  submitFile(file)
}

function submitFile(file, name) {
  if (props.disabled) return

  const formData = new FormData()

  name = name || file.name.replace(/[^\w\s.]/gi, '')

  formData.append('filename', name)
  formData.append('file', file, name)

  if (props.dst) {
    const fullPath = props.dst.endsWith('\\')
      ? props.dst + name
      : props.dst + '\\' + name

    formData.append('dst', fullPath)
  }

  showProgress.value = true
  axios.post(
    (props.domain || '') + (props.action || '/api/file/upload'),
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (e) => {
        uploadPercentage.value = Math.round(
          (e.loaded * 100) / (e.total || 1)
        )
      }
    }
  )
    .then((r) => {
      emit('input', r.data)
      emit('update:value', r.data)
    })
    .catch((err) => {
      console.error('Upload error:', err)
    })
    .finally(() => {
      showProgress.value = false
    })
}
</script>