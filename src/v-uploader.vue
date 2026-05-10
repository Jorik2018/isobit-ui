<template>
  <div
    class="v-uploader"
    :class="onlyicon ? '' : 'v-button ui-widget ui-state-default ui-corner-all'"
    :style="{ padding: onlyicon ? '0px' : '' }"
    @click="handleClick"
  >
    <label style="cursor:pointer">
      <input
        v-if="!click"
        type="file"
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

/**
 * Props
 */
const props = defineProps({
  value: String,
  onlyicon: Boolean,
  click: Function,
  icon: String,
  domain: String,
  dst: String
})

/**
 * Emits
 */
const emit = defineEmits(['update:value', 'input'])

/**
 * State
 */
const uploadPercentage = ref(0)
const showProgress = ref(false)

/**
 * Optional click override
 */
function handleClick() {
  if (props.click) {
    props.click()
  }
}

/**
 * File handler
 */
function handleFileUpload(event) {
  const file = event.target.files?.[0]
  if (!file) return

  uploadPercentage.value = 0
  submitFile(file)
}

/**
 * Upload logic
 */
function submitFile(file, name) {
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
    (props.domain || '') + '/api/file/upload',
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